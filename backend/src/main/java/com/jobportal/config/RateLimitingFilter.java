package com.jobportal.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, BucketEntry> buckets = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor = Executors.newSingleThreadScheduledExecutor();

    private final Bandwidth defaultLimit = Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1)));
    private final Bandwidth authLimit = Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1)));

    public RateLimitingFilter() {
        // Schedule cleanup every 10 minutes
        cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredBuckets, 10, 10, TimeUnit.MINUTES);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String clientIp = getClientIp(request);
        boolean isAuthEndpoint = request.getRequestURI().startsWith("/api/v1/auth/");
        String bucketKey = clientIp + ":" + request.getRequestURI();

        BucketEntry entry = buckets.computeIfAbsent(bucketKey, k ->
                new BucketEntry(Bucket.builder().addLimit(isAuthEndpoint ? authLimit : defaultLimit).build()));
        entry.updateLastAccess();

        if (entry.getBucket().tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Rate limit exceeded. Try again later.\"}");
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void cleanupExpiredBuckets() {
        Instant cutoff = Instant.now().minus(Duration.ofMinutes(30));
        buckets.entrySet().removeIf(entry -> entry.getValue().getLastAccess().isBefore(cutoff));
    }

    @Override
    public void destroy() {
        cleanupExecutor.shutdown();
    }

    private static class BucketEntry {
        private final Bucket bucket;
        private Instant lastAccess;

        BucketEntry(Bucket bucket) {
            this.bucket = bucket;
            this.lastAccess = Instant.now();
        }

        Bucket getBucket() {
            return bucket;
        }

        Instant getLastAccess() {
            return lastAccess;
        }

        void updateLastAccess() {
            this.lastAccess = Instant.now();
        }
    }
}

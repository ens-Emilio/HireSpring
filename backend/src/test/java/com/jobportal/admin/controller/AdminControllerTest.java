package com.jobportal.admin.controller;

import com.jobportal.admin.dto.ModerateJobRequest;
import com.jobportal.admin.service.AdminService;
import com.jobportal.auth.security.JwtService;
import com.jobportal.auth.security.TokenBlacklistService;
import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.config.SecurityConfig;
import com.jobportal.job.dto.JobResponse;
import com.jobportal.job.entity.JobLevel;
import com.jobportal.job.entity.JobStatus;
import com.jobportal.job.entity.JobType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private ObjectMapper objectMapper;

    private JobResponse createJobResponse(String id, String title) {
        JobResponse r = new JobResponse();
        r.setId(id);
        r.setTitle(title);
        r.setDescription("Description");
        r.setJobType(JobType.FULLTIME);
        r.setLevel(JobLevel.MID);
        r.setStatus(JobStatus.ACTIVE);
        r.setCompanyName("Test Company");
        return r;
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void getStats_Success() throws Exception {
        when(adminService.getStats()).thenReturn(Map.of(
                "totalUsers", 100L,
                "activeJobs", 42L,
                "totalCompanies", 15L
        ));

        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(100))
                .andExpect(jsonPath("$.activeJobs").value(42))
                .andExpect(jsonPath("$.totalCompanies").value(15));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void getAllJobs_Success() throws Exception {
        Page<JobResponse> page = new PageImpl<>(List.of(createJobResponse("job-1", "Engineer")));
        when(adminService.getAllJobs(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/admin/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Engineer"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void moderateJob_Success() throws Exception {
        ModerateJobRequest request = new ModerateJobRequest();
        request.setStatus(JobStatus.CLOSED);

        JobResponse response = createJobResponse("job-1", "Engineer");
        response.setStatus(JobStatus.CLOSED);

        when(adminService.moderateJob("job-1", request)).thenReturn(response);

        mockMvc.perform(put("/api/v1/admin/jobs/job-1/moderate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void moderateJob_NotFound_Returns404() throws Exception {
        ModerateJobRequest request = new ModerateJobRequest();
        request.setStatus(JobStatus.CLOSED);

        when(adminService.moderateJob(eq("missing"), any()))
                .thenThrow(new ResourceNotFoundException("Job not found"));

        mockMvc.perform(put("/api/v1/admin/jobs/missing/moderate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Job not found"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void resetSeed_Success() throws Exception {
        mockMvc.perform(post("/api/v1/admin/seed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Seed reset triggered - check logs"));
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = "RECRUITER")
    void getStats_AsRecruiter_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "candidate@test.com", roles = "CANDIDATE")
    void getStats_AsCandidate_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getStats_WithoutAuth_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());
    }
}

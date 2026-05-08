package com.jobportal.job.controller;

import com.jobportal.auth.security.JwtService;
import com.jobportal.auth.security.TokenBlacklistService;
import com.jobportal.common.exception.ForbiddenException;
import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.config.SecurityConfig;
import com.jobportal.job.dto.JobCreateRequest;
import com.jobportal.job.dto.JobResponse;
import com.jobportal.job.dto.JobUpdateRequest;
import com.jobportal.job.entity.JobLevel;
import com.jobportal.job.entity.JobStatus;
import com.jobportal.job.entity.JobType;
import com.jobportal.job.service.JobService;
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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobController.class)
@Import(SecurityConfig.class)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobService jobService;

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
        r.setLocation("Remote");
        r.setRemote(false);
        r.setHybrid(false);
        r.setStatus(JobStatus.ACTIVE);
        r.setCompanyName("Test Company");
        return r;
    }

    @Test
    void getJobs_PublicAccess_Success() throws Exception {
        Page<JobResponse> page = new PageImpl<>(List.of(createJobResponse("job-1", "Engineer")));
        when(jobService.getAllJobs(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Engineer"));
    }

    @Test
    void getJobs_WithSearchParam_CallsSearch() throws Exception {
        Page<JobResponse> page = new PageImpl<>(List.of(createJobResponse("job-1", "Software Engineer")));
        when(jobService.searchJobs(eq("software"), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/jobs?search=software"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Software Engineer"));
    }

    @Test
    void getJobById_PublicAccess_Success() throws Exception {
        when(jobService.getJobById("job-1")).thenReturn(createJobResponse("job-1", "Engineer"));

        mockMvc.perform(get("/api/v1/jobs/job-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("job-1"))
                .andExpect(jsonPath("$.title").value("Engineer"));
    }

    @Test
    void getJobById_NotFound_Returns404() throws Exception {
        when(jobService.getJobById("missing")).thenThrow(new ResourceNotFoundException("Job not found"));

        mockMvc.perform(get("/api/v1/jobs/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Job not found"));
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = "RECRUITER")
    void createJob_Success() throws Exception {
        JobCreateRequest request = new JobCreateRequest();
        request.setCompanyId("comp-1");
        request.setTitle("New Job");
        request.setDescription("Description");
        request.setJobType(JobType.FULLTIME);
        request.setLevel(JobLevel.MID);

        when(jobService.createJob(eq("recruiter@test.com"), any(JobCreateRequest.class)))
                .thenReturn(createJobResponse("job-1", "New Job"));

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Job"));
    }

    @Test
    @WithMockUser(username = "candidate@test.com", roles = "CANDIDATE")
    void createJob_AsCandidate_ReturnsForbidden() throws Exception {
        JobCreateRequest request = new JobCreateRequest();
        request.setCompanyId("comp-1");
        request.setTitle("New Job");
        request.setDescription("Description");
        request.setJobType(JobType.FULLTIME);
        request.setLevel(JobLevel.MID);

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createJob_WithoutAuth_ReturnsForbidden() throws Exception {
        JobCreateRequest request = new JobCreateRequest();
        request.setCompanyId("comp-1");
        request.setTitle("New Job");
        request.setDescription("Description");
        request.setJobType(JobType.FULLTIME);
        request.setLevel(JobLevel.MID);

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = "RECRUITER")
    void updateJob_Success() throws Exception {
        JobUpdateRequest request = new JobUpdateRequest();
        request.setTitle("Updated Job");

        when(jobService.updateJob(eq("job-1"), eq("recruiter@test.com"), any(JobUpdateRequest.class)))
                .thenReturn(createJobResponse("job-1", "Updated Job"));

        mockMvc.perform(put("/api/v1/jobs/job-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Job"));
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = "RECRUITER")
    void updateJob_NotOwner_ReturnsForbidden() throws Exception {
        JobUpdateRequest request = new JobUpdateRequest();
        request.setTitle("Updated Job");

        when(jobService.updateJob(eq("job-1"), eq("recruiter@test.com"), any()))
                .thenThrow(new ForbiddenException("You can only update your own jobs"));

        mockMvc.perform(put("/api/v1/jobs/job-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("You can only update your own jobs"));
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = "RECRUITER")
    void deleteJob_Success() throws Exception {
        doNothing().when(jobService).deleteJob("job-1", "recruiter@test.com");

        mockMvc.perform(delete("/api/v1/jobs/job-1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = "RECRUITER")
    void deleteJob_NotOwner_ReturnsForbidden() throws Exception {
        doThrow(new ForbiddenException("You can only delete your own jobs"))
                .when(jobService).deleteJob("job-1", "recruiter@test.com");

        mockMvc.perform(delete("/api/v1/jobs/job-1"))
                .andExpect(status().isForbidden());
    }
}

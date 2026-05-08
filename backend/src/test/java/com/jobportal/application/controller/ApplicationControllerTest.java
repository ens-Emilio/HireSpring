package com.jobportal.application.controller;

import com.jobportal.application.dto.ApplicationResponse;
import com.jobportal.application.dto.UpdateStageRequest;
import com.jobportal.application.entity.ApplicationStatus;
import com.jobportal.application.service.ApplicationService;
import com.jobportal.auth.security.JwtService;
import com.jobportal.auth.security.TokenBlacklistService;
import com.jobportal.config.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ApplicationController.class)
@Import(SecurityConfig.class)
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ApplicationService applicationService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private ObjectMapper objectMapper;

    private ApplicationResponse createAppResponse(String id, String jobTitle) {
        ApplicationResponse r = new ApplicationResponse();
        r.setId(id);
        r.setJobId("job-1");
        r.setJobTitle(jobTitle);
        r.setCandidateId("user-1");
        r.setCandidateName("candidate@test.com");
        r.setStatus(ApplicationStatus.APPLIED);
        r.setPipelineStage(0);
        return r;
    }

    @Test
    @WithMockUser(username = "candidate@test.com", roles = "CANDIDATE")
    void applyToJob_Success() throws Exception {
        when(applicationService.applyToJob("candidate@test.com", "job-1", "Cover letter"))
                .thenReturn(createAppResponse("app-1", "Software Engineer"));

        mockMvc.perform(post("/api/v1/applications/jobs/job-1/apply")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("Cover letter"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.jobTitle").value("Software Engineer"))
                .andExpect(jsonPath("$.status").value("APPLIED"));
    }

    @Test
    @WithMockUser(username = "candidate@test.com", roles = "CANDIDATE")
    void getMyApplications_Success() throws Exception {
        Page<ApplicationResponse> page = new PageImpl<>(List.of(createAppResponse("app-1", "Engineer")));
        when(applicationService.getMyApplications(eq("candidate@test.com"), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/applications/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].jobTitle").value("Engineer"));
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = "RECRUITER")
    void getJobApplications_Success() throws Exception {
        Page<ApplicationResponse> page = new PageImpl<>(List.of(createAppResponse("app-1", "Engineer")));
        when(applicationService.getJobApplications("job-1", PageRequest.of(0, 20)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/applications/job/job-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].jobTitle").value("Engineer"));
    }

    @Test
    @WithMockUser(username = "candidate@test.com", roles = "CANDIDATE")
    void getJobApplications_AsCandidate_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/applications/job/job-1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = "RECRUITER")
    void updateStage_Success() throws Exception {
        UpdateStageRequest request = new UpdateStageRequest();
        request.setStage(1);
        request.setNotes("Phone screen scheduled");

        ApplicationResponse response = createAppResponse("app-1", "Engineer");
        response.setPipelineStage(1);
        response.setStatus(ApplicationStatus.SCREENING);

        when(applicationService.updateStage(eq("app-1"), any(UpdateStageRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/applications/app-1/stage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pipelineStage").value(1))
                .andExpect(jsonPath("$.status").value("SCREENING"));
    }

    @Test
    void applyToJob_WithoutAuth_ReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/v1/applications/jobs/job-1/apply")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("Cover"))
                .andExpect(status().isForbidden());
    }
}

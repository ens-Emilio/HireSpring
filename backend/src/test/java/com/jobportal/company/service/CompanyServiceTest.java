package com.jobportal.company.service;

import com.jobportal.common.exception.ForbiddenException;
import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.company.dto.CompanyCreateRequest;
import com.jobportal.company.dto.CompanyResponse;
import com.jobportal.company.dto.CompanyUpdateRequest;
import com.jobportal.company.entity.Company;
import com.jobportal.company.entity.CompanySize;
import com.jobportal.company.entity.RecruiterProfile;
import com.jobportal.company.repository.CompanyRepository;
import com.jobportal.company.repository.RecruiterProfileRepository;
import com.jobportal.user.entity.Role;
import com.jobportal.user.entity.User;
import com.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private RecruiterProfileRepository recruiterProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CompanyService companyService;

    private User testUser;
    private Company testCompany;
    private RecruiterProfile testProfile;
    private CompanyCreateRequest createRequest;
    private CompanyUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-1")
                .email("recruiter@test.com")
                .role(Role.RECRUITER)
                .build();

        testCompany = Company.builder()
                .id("company-1")
                .name("Tech Corp")
                .website("https://techcorp.com")
                .description("A tech company")
                .industry("Technology")
                .location("New York")
                .size(CompanySize.MEDIUM)
                .verified(false)
                .build();

        testProfile = RecruiterProfile.builder()
                .id("profile-1")
                .user(testUser)
                .fullName("John Doe")
                .company(testCompany)
                .build();

        createRequest = new CompanyCreateRequest();
        createRequest.setName("Tech Corp");
        createRequest.setWebsite("https://techcorp.com");
        createRequest.setDescription("A tech company");
        createRequest.setIndustry("Technology");
        createRequest.setLocation("New York");
        createRequest.setSize(CompanySize.MEDIUM);
        createRequest.setRecruiterName("John Doe");
        createRequest.setPosition("HR Manager");

        updateRequest = new CompanyUpdateRequest();
        updateRequest.setName("Updated Tech Corp");
        updateRequest.setWebsite("https://updated.com");
        updateRequest.setDescription("Updated description");
    }

    @Test
    void getAllCompanies_ReturnsPage() {
        Page<Company> page = new PageImpl<>(List.of(testCompany));
        when(companyRepository.findAll(any(PageRequest.class))).thenReturn(page);

        Page<CompanyResponse> result = companyService.getAllCompanies(PageRequest.of(0, 20));

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Tech Corp", result.getContent().get(0).getName());
    }

    @Test
    void getCompanyById_Success() {
        when(companyRepository.findById("company-1")).thenReturn(Optional.of(testCompany));

        CompanyResponse result = companyService.getCompanyById("company-1");

        assertNotNull(result);
        assertEquals("Tech Corp", result.getName());
    }

    @Test
    void getCompanyById_NotFound() {
        when(companyRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.getCompanyById("unknown"));
    }

    @Test
    void createCompany_Success() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(companyRepository.save(any(Company.class))).thenReturn(testCompany);
        when(recruiterProfileRepository.save(any(RecruiterProfile.class))).thenReturn(testProfile);

        CompanyResponse result = companyService.createCompany("user-1", createRequest);

        assertNotNull(result);
        assertEquals("Tech Corp", result.getName());
        verify(companyRepository).save(any(Company.class));
        verify(recruiterProfileRepository).save(any(RecruiterProfile.class));
    }

    @Test
    void createCompany_UserNotFound() {
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.createCompany("unknown", createRequest));
        verify(companyRepository, never()).save(any());
    }

    @Test
    void updateCompany_Success() {
        when(recruiterProfileRepository.findByUserId("user-1")).thenReturn(Optional.of(testProfile));
        when(companyRepository.findById("company-1")).thenReturn(Optional.of(testCompany));
        when(companyRepository.save(any(Company.class))).thenReturn(testCompany);

        CompanyResponse result = companyService.updateCompany("company-1", "user-1", updateRequest);

        assertNotNull(result);
        assertEquals("Updated Tech Corp", result.getName());
        assertEquals("https://updated.com", result.getWebsite());
    }

    @Test
    void updateCompany_NotOwner() {
        RecruiterProfile otherProfile = RecruiterProfile.builder()
                .user(testUser)
                .company(Company.builder().id("other-company").build())
                .build();

        when(recruiterProfileRepository.findByUserId("user-1")).thenReturn(Optional.of(otherProfile));
        when(companyRepository.findById("company-1")).thenReturn(Optional.of(testCompany));

        assertThrows(ForbiddenException.class, () -> companyService.updateCompany("company-1", "user-1", updateRequest));
    }

    @Test
    void updateCompany_ProfileNotFound() {
        when(recruiterProfileRepository.findByUserId("user-1")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.updateCompany("company-1", "user-1", updateRequest));
    }

    @Test
    void updateCompany_CompanyNotFound() {
        when(recruiterProfileRepository.findByUserId("user-1")).thenReturn(Optional.of(testProfile));
        when(companyRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.updateCompany("unknown", "user-1", updateRequest));
    }
}

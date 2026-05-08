package com.jobportal.company.service;

import com.jobportal.common.exception.ForbiddenException;
import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.common.mapper.DtoMapper;
import com.jobportal.company.dto.CompanyCreateRequest;
import com.jobportal.company.dto.CompanyResponse;
import com.jobportal.company.dto.CompanyUpdateRequest;
import com.jobportal.company.entity.Company;
import com.jobportal.company.entity.RecruiterProfile;
import com.jobportal.company.repository.CompanyRepository;
import com.jobportal.company.repository.RecruiterProfileRepository;
import com.jobportal.user.entity.User;
import com.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;

    public Page<CompanyResponse> getAllCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable).map(DtoMapper::toCompanyResponse);
    }

    public CompanyResponse getCompanyById(String id) {
        return DtoMapper.toCompanyResponse(companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found")));
    }

    @Transactional
    public CompanyResponse createCompany(String userId, CompanyCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Company company = Company.builder()
                .name(request.getName())
                .website(request.getWebsite())
                .description(request.getDescription())
                .industry(request.getIndustry())
                .location(request.getLocation())
                .build();

        if (request.getSize() != null) {
            company.setSize(request.getSize());
        }

        company = companyRepository.save(company);

        RecruiterProfile recruiterProfile = RecruiterProfile.builder()
                .user(user)
                .fullName(request.getRecruiterName() != null ? request.getRecruiterName() : user.getEmail())
                .position(request.getPosition())
                .company(company)
                .build();
        recruiterProfileRepository.save(recruiterProfile);

        log.info("Company created: {} by user {}", company.getName(), userId);
        return DtoMapper.toCompanyResponse(company);
    }

    @Transactional
    public CompanyResponse updateCompany(String companyId, String userId, CompanyUpdateRequest request) {
        RecruiterProfile profile = recruiterProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (profile.getCompany() == null || !profile.getCompany().getId().equals(companyId)) {
            throw new ForbiddenException("You can only update your own company");
        }

        if (request.getName() != null) company.setName(request.getName());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
        if (request.getLocation() != null) company.setLocation(request.getLocation());
        if (request.getLogoUrl() != null) company.setLogoUrl(request.getLogoUrl());
        if (request.getSize() != null) company.setSize(request.getSize());

        log.info("Company updated: {} by user {}", company.getName(), userId);
        return DtoMapper.toCompanyResponse(companyRepository.save(company));
    }
}

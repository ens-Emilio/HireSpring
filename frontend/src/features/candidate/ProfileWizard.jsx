import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useToast } from '../../contexts/ToastContext'
import api from '../../lib/api'

const STEPS = [
  { id: 'personal', label: 'Informações pessoais' },
  { id: 'about', label: 'Sobre mim' },
  { id: 'experience', label: 'Experiências' },
  { id: 'education', label: 'Formação' },
  { id: 'skills', label: 'Habilidades' },
  { id: 'preferences', label: 'Preferências' },
]

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Express',
  'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'REST', 'GraphQL',
  'HTML', 'CSS', 'Tailwind', 'SASS', 'Figma', 'Photoshop',
  'Agile', 'Scrum', 'Kanban', 'Linux', 'Nginx', 'Apache',
]

const WORK_MODES = [
  { value: 'remote', label: 'Remoto' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'onsite', label: 'Presencial' },
]

const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Imediata' },
  { value: '2weeks', label: 'Até 2 semanas' },
  { value: '1month', label: 'Até 1 mês' },
  { value: '2months', label: 'Até 2 meses' },
  { value: 'notlooking', label: 'Não estou buscando' },
]

function defaultFormData() {
  return {
    personal: { fullName: '', title: '', location: '', phone: '', photoUrl: '' },
    about: { bio: '', linkedin: '', github: '', portfolio: '' },
    experience: [],
    education: [],
    skills: [],
    preferences: { workMode: 'remote', salaryMin: 0, salaryMax: 10000, availability: 'immediate' },
  }
}

export default function ProfileWizard() {
  const toast = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/candidates/me').then((r) => r.data),
  })

  const [formData, setFormData] = useState(defaultFormData())

  useEffect(() => {
    if (profile) {
      setFormData({
        personal: {
          fullName: profile.fullName || '',
          title: profile.headline || '',
          location: profile.location || '',
          phone: profile.phone || '',
          photoUrl: profile.photoUrl || '',
        },
        about: {
          bio: profile.bio || '',
          linkedin: profile.linkedin || '',
          github: profile.github || '',
          portfolio: profile.portfolio || '',
        },
        experience: profile.experiences || [],
        education: profile.educations || [],
        skills: profile.skills || [],
        preferences: {
          workMode: profile.workMode || 'remote',
          salaryMin: profile.salaryMin || 0,
          salaryMax: profile.salaryMax || 10000,
          availability: profile.availability || 'immediate',
        },
      })
    }
  }, [profile])

  const saveMutation = useMutation({
    mutationFn: (data) => api.put('/candidates/me', data),
  })

  const autosave = useCallback(() => {
    const payload = {
      fullName: formData.personal.fullName,
      headline: formData.personal.title,
      location: formData.personal.location,
      phone: formData.personal.phone,
      photoUrl: formData.personal.photoUrl,
      bio: formData.about.bio,
      linkedin: formData.about.linkedin,
      github: formData.about.github,
      portfolio: formData.about.portfolio,
      experiences: formData.experience,
      educations: formData.education,
      skills: formData.skills,
      workMode: formData.preferences.workMode,
      salaryMin: formData.preferences.salaryMin,
      salaryMax: formData.preferences.salaryMax,
      availability: formData.preferences.availability,
    }
    saveMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Perfil atualizado com sucesso!')
      },
    })
  }, [formData, saveMutation, toast])

  const validateStep = (step) => {
    const newErrors = {}
    switch (step) {
      case 0:
        if (!formData.personal.fullName.trim()) newErrors.fullName = 'Nome é obrigatório'
        if (!formData.personal.title.trim()) newErrors.title = 'Título profissional é obrigatório'
        break
      case 1:
        if (!formData.about.bio.trim()) newErrors.bio = 'Bio é obrigatória'
        if (formData.about.bio.length > 500) newErrors.bio = 'Bio deve ter no máximo 500 caracteres'
        break
      case 2:
        break
      case 3:
        break
      case 4:
        if (formData.skills.length === 0) newErrors.skills = 'Adicione pelo menos uma habilidade'
        break
      case 5:
        break
      default:
        break
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return
    autosave()
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      autosave()
      setCurrentStep((s) => s - 1)
    }
  }

  const handleFinish = () => {
    if (!validateStep(currentStep)) return
    autosave()
  }

  const handleSaveAndExit = () => {
    autosave()
  }

  const updatePersonal = (field, value) => {
    setFormData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const updateAbout = (field, value) => {
    setFormData((prev) => ({ ...prev, about: { ...prev.about, [field]: value } }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', startDate: '', endDate: '', description: '', current: false }],
    }))
  }

  const updateExperience = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.experience]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, experience: updated }
    })
  }

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }))
  }

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, { institution: '', course: '', startDate: '', endDate: '', current: false }],
    }))
  }

  const updateEducation = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.education]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, education: updated }
    })
  }

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  const addSkill = (skill) => {
    const trimmed = skill.trim()
    if (!trimmed) return
    if (formData.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: trimmed, level: 3 }],
    }))
    if (errors.skills) setErrors((prev) => ({ ...prev, skills: null }))
  }

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const updateSkillLevel = (index, level) => {
    setFormData((prev) => {
      const updated = [...prev.skills]
      updated[index] = { ...updated[index], level }
      return { ...prev, skills: updated }
    })
  }

  const updatePreference = (field, value) => {
    setFormData((prev) => ({ ...prev, preferences: { ...prev.preferences, [field]: value } }))
  }

  if (profileLoading) {
    return (
      <div className="max-w-3xl mx-auto card animate-pulse">
        <div className="h-2 bg-gray-200 rounded mb-6 w-full" />
        <div className="h-8 bg-gray-200 rounded mb-4 w-48" />
        <div className="h-4 bg-gray-200 rounded w-64" />
      </div>
    )
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Editar Perfil</h1>
          <button type="button" className="btn-ghost" onClick={handleSaveAndExit} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando...' : 'Salvar e sair'}
          </button>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {STEPS.map((step, i) => {
            let bulletClass = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all'
            let labelClass = 'text-xs mt-1 text-center'
            if (i < currentStep) {
              bulletClass += ' bg-green-500 text-white'
            } else if (i === currentStep) {
              bulletClass += ' bg-primary-600 text-white'
            } else {
              bulletClass += ' bg-gray-200 text-gray-500'
            }
            return (
              <div key={step.id} className="flex flex-col items-center flex-1 min-w-[60px]">
                <div className={bulletClass}>
                  {i < currentStep ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i === currentStep ? (
                    <span className="w-2 h-2 bg-white rounded-full" />
                  ) : (
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </div>
                <span className={labelClass}>{step.label.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{STEPS[0].label}</h2>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                  {formData.personal.photoUrl ? (
                    <img src={formData.personal.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Alterar foto
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          updatePersonal('photoUrl', ev.target.result)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <p className="form-hint mt-1">JPG, PNG. Máx 2MB.</p>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Nome completo</label>
                <input
                  type="text"
                  className={`input-field ${errors.fullName ? 'input-error' : ''}`}
                  value={formData.personal.fullName}
                  onChange={(e) => updatePersonal('fullName', e.target.value)}
                  placeholder="Seu nome completo"
                />
                {errors.fullName && <p className="form-error">{errors.fullName}</p>}
              </div>

              <div className="form-group">
                <label className="label">Título profissional</label>
                <input
                  type="text"
                  className={`input-field ${errors.title ? 'input-error' : ''}`}
                  value={formData.personal.title}
                  onChange={(e) => updatePersonal('title', e.target.value)}
                  placeholder="ex: Desenvolvedor Full Stack"
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Localização</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.personal.location}
                    onChange={(e) => updatePersonal('location', e.target.value)}
                    placeholder="Cidade, Estado"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Telefone</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.personal.phone}
                    onChange={(e) => updatePersonal('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{STEPS[1].label}</h2>

              <div className="form-group">
                <label className="label">Bio</label>
                <textarea
                  className={`input-field ${errors.bio ? 'input-error' : ''}`}
                  value={formData.about.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) updateAbout('bio', e.target.value)
                  }}
                  rows={5}
                  placeholder="Conte um pouco sobre você, suas experiências e objetivos..."
                />
                <div className="flex justify-between mt-1">
                  {errors.bio ? <p className="form-error">{errors.bio}</p> : <span />}
                  <span className={`form-hint ${formData.about.bio.length >= 480 ? 'text-red-500' : ''}`}>
                    {formData.about.bio.length}/500
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="label">LinkedIn</label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.about.linkedin}
                  onChange={(e) => updateAbout('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/seu-perfil"
                />
              </div>

              <div className="form-group">
                <label className="label">GitHub</label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.about.github}
                  onChange={(e) => updateAbout('github', e.target.value)}
                  placeholder="https://github.com/seu-usuario"
                />
              </div>

              <div className="form-group">
                <label className="label">Portfólio</label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.about.portfolio}
                  onChange={(e) => updateAbout('portfolio', e.target.value)}
                  placeholder="https://seuportfolio.com"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{STEPS[2].label}</h2>
                <button type="button" className="btn-primary text-xs" onClick={addExperience}>
                  + Adicionar
                </button>
              </div>

              {formData.experience.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma experiência adicionada</p>
                  <button type="button" className="btn-ghost mt-2 text-xs" onClick={addExperience}>
                    Adicionar experiência
                  </button>
                </div>
              )}

              {formData.experience.map((exp, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">Experiência {i + 1}</span>
                    <button type="button" className="btn-ghost text-xs text-red-500" onClick={() => removeExperience(i)}>
                      Remover
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Empresa"
                      value={exp.company}
                      onChange={(e) => updateExperience(i, 'company', e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Cargo"
                      value={exp.role}
                      onChange={(e) => updateExperience(i, 'role', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="month"
                      className="input-field"
                      placeholder="Início"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(i, 'startDate', e.target.value)}
                    />
                    <input
                      type="month"
                      className="input-field"
                      placeholder="Fim"
                      value={exp.endDate}
                      disabled={exp.current}
                      onChange={(e) => updateExperience(i, 'endDate', e.target.value)}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={exp.current || false}
                      onChange={(e) => updateExperience(i, 'current', e.target.checked)}
                      className="checkbox-field"
                    />
                    Trabalho aqui atualmente
                  </label>
                  <textarea
                    className="input-field"
                    placeholder="Descrição das atividades..."
                    value={exp.description}
                    onChange={(e) => updateExperience(i, 'description', e.target.value)}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{STEPS[3].label}</h2>
                <button type="button" className="btn-primary text-xs" onClick={addEducation}>
                  + Adicionar
                </button>
              </div>

              {formData.education.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma formação adicionada</p>
                  <button type="button" className="btn-ghost mt-2 text-xs" onClick={addEducation}>
                    Adicionar formação
                  </button>
                </div>
              )}

              {formData.education.map((edu, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">Formação {i + 1}</span>
                    <button type="button" className="btn-ghost text-xs text-red-500" onClick={() => removeEducation(i)}>
                      Remover
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Instituição"
                      value={edu.institution}
                      onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Curso"
                      value={edu.course}
                      onChange={(e) => updateEducation(i, 'course', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="month"
                      className="input-field"
                      placeholder="Início"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(i, 'startDate', e.target.value)}
                    />
                    <input
                      type="month"
                      className="input-field"
                      placeholder="Fim"
                      value={edu.endDate}
                      disabled={edu.current || false}
                      onChange={(e) => updateEducation(i, 'endDate', e.target.value)}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={edu.current || false}
                      onChange={(e) => updateEducation(i, 'current', e.target.checked)}
                      className="checkbox-field"
                    />
                    Cursando atualmente
                  </label>
                </div>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{STEPS[4].label}</h2>

              <SkillTagInput
                skills={formData.skills}
                onAdd={addSkill}
                onRemove={removeSkill}
                onUpdateLevel={updateSkillLevel}
                error={errors.skills}
              />
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">{STEPS[5].label}</h2>

              <div className="form-group">
                <label className="label">Modalidade de trabalho</label>
                <div className="flex gap-4 mt-2">
                  {WORK_MODES.map((mode) => (
                    <label key={mode.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="workMode"
                        value={mode.value}
                        checked={formData.preferences.workMode === mode.value}
                        onChange={(e) => updatePreference('workMode', e.target.value)}
                        className="radio-field"
                      />
                      <span className="text-sm">{mode.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">
                  Faixa salarial: R${formData.preferences.salaryMin.toLocaleString('pt-BR')} - R${formData.preferences.salaryMax.toLocaleString('pt-BR')}
                </label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16">Mínimo</span>
                    <input
                      type="range"
                      min={0}
                      max={20000}
                      step={500}
                      value={formData.preferences.salaryMin}
                      onChange={(e) => updatePreference('salaryMin', Math.min(Number(e.target.value), formData.preferences.salaryMax))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16">Máximo</span>
                    <input
                      type="range"
                      min={0}
                      max={20000}
                      step={500}
                      value={formData.preferences.salaryMax}
                      onChange={(e) => updatePreference('salaryMax', Math.max(Number(e.target.value), formData.preferences.salaryMin))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Disponibilidade</label>
                <select
                  className="select-field"
                  value={formData.preferences.availability}
                  onChange={(e) => updatePreference('availability', e.target.value)}
                >
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePrev}
              disabled={currentStep === 0 || saveMutation.isPending}
            >
              Anterior
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button type="button" className="btn-primary" onClick={handleNext} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Próximo'}
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={handleFinish} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Concluir'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

function SkillTagInput({ skills, onAdd, onRemove, onUpdateLevel, error }) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)

  const filteredSuggestions = input.length > 0
    ? SKILL_SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(input.toLowerCase()) &&
          !skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase())
      ).slice(0, 8)
    : []

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = input.replace(',', '').trim()
      if (val) {
        onAdd(val)
        setInput('')
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className={`input-field ${error ? 'input-error' : ''}`}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma habilidade e pressione Enter..."
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  onAdd(s)
                  setInput('')
                  setShowSuggestions(false)
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <div key={i} className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{skill.name}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onUpdateLevel(i, lvl)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      lvl <= skill.level ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    title={`Nível ${lvl}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

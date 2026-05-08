import { PaperAirplaneIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, DocumentCheckIcon, CheckBadgeIcon, XCircleIcon } from '@heroicons/react/24/outline';

const statusMap = {
  APPLIED: { label: 'Inscrito', icon: PaperAirplaneIcon, color: 'status-APPLIED' },
  SCREENING: { label: 'Em triagem', icon: MagnifyingGlassIcon, color: 'status-SCREENING' },
  INTERVIEW: { label: 'Entrevista', icon: ChatBubbleLeftRightIcon, color: 'status-INTERVIEW' },
  OFFER: { label: 'Oferta', icon: DocumentCheckIcon, color: 'status-OFFER' },
  HIRED: { label: 'Contratado', icon: CheckBadgeIcon, color: 'status-HIRED' },
  REJECTED: { label: 'Não selecionado', icon: XCircleIcon, color: 'status-REJECTED' },
};

export function StatusBadge({ status, showIcon = true }) {
  const config = statusMap[status] || statusMap.APPLIED;
  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.color}`}>
      {showIcon && <Icon className="h-4 w-4 inline" />}
      {config.label}
    </span>
  );
}

export default StatusBadge;

const typeMap = {
  FULL_TIME: 'Tempo integral',
  PART_TIME: 'Meio período',
  CONTRACT: 'Contrato',
  FREELANCE: 'Freelancer',
  INTERNSHIP: 'Estágio',
};

const levelMap = {
  JUNIOR: 'Júnior',
  MID: 'Pleno',
  SENIOR: 'Sênior',
  LEAD: 'Líder',
  MANAGER: 'Gerente',
};

export function JobBadges({ job }) {
  return (
    <div className="job-badges">
      {job.type && <span className="badge badge-type">{typeMap[job.type] || job.type}</span>}
      {job.level && <span className="badge badge-level">{levelMap[job.level] || job.level}</span>}
      {job.remote && <span className="badge badge-remote">Remoto</span>}
      {job.hybrid && <span className="badge badge-hybrid">Híbrido</span>}
      {job.onsite && <span className="badge badge-onsite">Presencial</span>}
    </div>
  );
}

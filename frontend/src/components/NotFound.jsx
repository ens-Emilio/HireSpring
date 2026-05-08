import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-md w-full text-center animate-fade-in">
        <div className="text-8xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Página não encontrada
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <HomeIcon className="w-5 h-5" />
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}

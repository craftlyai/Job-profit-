import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Briefcase, PlusCircle, FileText, User } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/jobs/new', label: 'Add Job', icon: PlusCircle },
  { path: '/', label: 'Invoice', icon: FileText },
  { path: '/profile', label: 'Profile', icon: User },
]

function Navbar() {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (item) => {
    if (item.path === '/jobs/new') return currentPath === '/jobs/new'
    if (item.label === 'Jobs') return currentPath === '/jobs'
    if (item.label === 'Home') return currentPath === '/'
    if (item.label === 'Invoice') return currentPath.includes('invoice')
    if (item.label === 'Profile') return currentPath === '/profile'
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                active ? 'text-navy-900' : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Navbar
                

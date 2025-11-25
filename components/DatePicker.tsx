'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'

interface DatePickerProps {
  value?: Date | string
  onChange: (date: Date | undefined) => void
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  label,
  required = false,
  className = '',
  minDate,
  maxDate,
}: DatePickerProps) {
  const [inputValue, setInputValue] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Inicializar valor
  useEffect(() => {
    if (value) {
      const date = typeof value === 'string' ? new Date(value) : value
      if (isValid(date)) {
        setInputValue(format(date, 'dd/MM/yyyy'))
      }
    } else {
      setInputValue('')
    }
  }, [value])

  // Fechar calendário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/\D/g, '') // Remove tudo que não é dígito

    // Limita a 8 dígitos (ddmmyyyy)
    if (newValue.length > 8) {
      newValue = newValue.slice(0, 8)
    }

    // Formata enquanto digita: dd/mm/yyyy
    let formatted = newValue
    if (newValue.length > 2) {
      formatted = newValue.slice(0, 2) + '/' + newValue.slice(2)
    }
    if (newValue.length > 4) {
      formatted = newValue.slice(0, 2) + '/' + newValue.slice(2, 4) + '/' + newValue.slice(4)
    }

    setInputValue(formatted)

    // Tenta parsear a data quando tiver 8 dígitos
    if (newValue.length === 8) {
      const day = parseInt(newValue.slice(0, 2))
      const month = parseInt(newValue.slice(2, 4)) - 1 // month é 0-indexed
      const year = parseInt(newValue.slice(4, 8))

      const parsedDate = new Date(year, month, day)
      if (isValid(parsedDate) && 
          parsedDate.getDate() === day && 
          parsedDate.getMonth() === month && 
          parsedDate.getFullYear() === year) {
        
        // Verifica limites
        if (minDate && parsedDate < minDate) return
        if (maxDate && parsedDate > maxDate) return

        onChange(parsedDate)
      }
    } else if (newValue.length === 0) {
      onChange(undefined)
    }
  }

  const handleDateSelect = (date: Date) => {
    if (minDate && date < minDate) return
    if (maxDate && date > maxDate) return

    setInputValue(format(date, 'dd/MM/yyyy'))
    onChange(date)
    setShowCalendar(false)
  }

  const handleClear = () => {
    setInputValue('')
    onChange(undefined)
  }

  // Calendário
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const selectedDate = value ? (typeof value === 'string' ? new Date(value) : value) : null

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-slate-700 text-sm mb-2 font-semibold tracking-wide">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowCalendar(true)}
          placeholder={placeholder}
          className="w-full bg-white border-2 border-slate-300 rounded-xl pl-4 pr-20 py-3 text-slate-800 text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-slate-400"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-all duration-200 group"
            >
              <X className="text-slate-400 group-hover:text-red-500 transition-colors" size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              showCalendar 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-slate-100 text-slate-500 hover:text-blue-600'
            }`}
          >
            <Calendar size={18} />
          </button>
        </div>

        {/* Calendário */}
        {showCalendar && (
          <div className="absolute z-50 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 p-6 w-80">
            {/* Navegação do mês */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 text-slate-600 hover:text-blue-600 hover:scale-110"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-slate-800 font-bold text-lg capitalize tracking-wide">
                {mesesNomes[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 text-slate-600 hover:text-blue-600 hover:scale-110"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-slate-600 text-xs font-bold py-2 tracking-wide">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do calendário */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                const isDisabled = 
                  (minDate && day < minDate) || 
                  (maxDate && day > maxDate)

                return (
                  <button
                    key={day.toString()}
                    type="button"
                    onClick={() => !isDisabled && handleDateSelect(day)}
                    disabled={isDisabled}
                    className={`
                      h-10 rounded-lg transition-all duration-200 text-sm font-semibold
                      ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                      ${isSelected ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-lg shadow-blue-500/50 scale-105' : ''}
                      ${!isSelected && isCurrentMonth && !isDisabled ? 'hover:bg-blue-50 hover:text-blue-600 hover:scale-105' : ''}
                      ${isToday && !isSelected ? 'border-2 border-blue-500 bg-blue-50 text-blue-600 font-bold' : ''}
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>

            {/* Botão hoje */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 text-sm font-bold tracking-wide shadow-md hover:shadow-lg"
              >
                Hoje
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

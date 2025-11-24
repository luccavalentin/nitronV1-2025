'use client'

import { useState, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import { useStore } from '@/store/useStore'
import { Clock, Play, Pause, RotateCcw, CheckCircle2, BookOpen, GraduationCap, ClipboardList, TrendingUp, Target, Activity, Settings, X, Save } from 'lucide-react'
import Modal from '@/components/Modal'
import { useAlert } from '@/hooks/useAlert'

export default function EstudosPage() {
  const { temasEstudo, materias, aulas, configuracoes } = useStore()
  const [minutes, setMinutes] = useState(configuracoes.pomodoroTempoTrabalho)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [mostrarConfig, setMostrarConfig] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const aulasConcluidas = aulas.filter(a => a.concluida).length
  const aulasPendentes = aulas.filter(a => !a.concluida).length
  const totalAulas = aulas.length
  const progressoGeral = totalAulas > 0 ? (aulasConcluidas / totalAulas) * 100 : 0

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            if (minutes === 0) {
              // Timer acabou
              handleTimerComplete()
              return 0
            }
            setMinutes((prevMin) => prevMin - 1)
            return 59
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, minutes])

  const handleTimerComplete = () => {
    setIsRunning(false)
    if (!isBreak) {
      // Pomodoro completo, iniciar pausa
      const novoCount = pomodoroCount + 1
      setPomodoroCount(novoCount)
      setIsBreak(true)
      // Verificar se é pausa longa
      const isPausaLonga = novoCount > 0 && novoCount % configuracoes.pomodoroPausaLongaApos === 0
      setMinutes(isPausaLonga ? configuracoes.pomodoroTempoPausaLonga : configuracoes.pomodoroTempoPausaCurta)
      setSeconds(0)
    } else {
      // Pausa completa, voltar ao trabalho
      setIsBreak(false)
      setMinutes(configuracoes.pomodoroTempoTrabalho)
      setSeconds(0)
    }
  }

  const handleStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsBreak(false)
    setMinutes(configuracoes.pomodoroTempoTrabalho)
    setSeconds(0)
  }

  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const tempoTotal = isBreak 
    ? (pomodoroCount > 0 && pomodoroCount % configuracoes.pomodoroPausaLongaApos === 0 
        ? configuracoes.pomodoroTempoPausaLonga 
        : configuracoes.pomodoroTempoPausaCurta) * 60
    : configuracoes.pomodoroTempoTrabalho * 60
  const tempoRestante = minutes * 60 + seconds
  const progress = ((tempoTotal - tempoRestante) / tempoTotal) * 100

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
            Dashboard de Estudos
          </h1>
          <p className="text-slate-400 text-lg">Gerencie seus estudos e mantenha o foco</p>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <BookOpen className="text-cyan-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{temasEstudo.length}</div>
            <div className="text-slate-400 text-sm">Temas de Estudo</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <GraduationCap className="text-blue-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{materias.length}</div>
            <div className="text-slate-400 text-sm">Matérias</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">{aulasConcluidas}</div>
            <div className="text-slate-400 text-sm">Aulas Concluídas</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <Target className="text-yellow-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">{pomodoroCount}</div>
            <div className="text-slate-400 text-sm">Pomodoros Hoje</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Timer Pomodoro */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/30 shadow-xl">
            <div className="text-center mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Clock className="text-cyan-400" size={28} />
                  Pomodoro Timer
                </h2>
                <button
                  onClick={() => setMostrarConfig(true)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  title="Configurar Pomodoro"
                >
                  <Settings className="text-slate-400 hover:text-white" size={20} />
                </button>
              </div>
              <p className="text-slate-400 text-sm">
                {isBreak 
                  ? (pomodoroCount > 0 && pomodoroCount % configuracoes.pomodoroPausaLongaApos === 0
                      ? 'Pausa Longa - Descanse bem!' 
                      : 'Pausa - Descanse um pouco!')
                  : 'Foco - Estude com dedicação!'}
              </p>
            </div>

            {/* Timer Display */}
            <div className="relative mb-8">
              <div className="w-64 h-64 mx-auto relative">
                {/* Progress Circle */}
                <svg className="transform -rotate-90 w-64 h-64">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-700"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                    className={`transition-all duration-1000 ${isBreak ? 'text-blue-400' : 'text-cyan-400'}`}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Time Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${isBreak ? 'text-blue-400' : 'text-cyan-400'}`}>
                      {formatTime(minutes, seconds)}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {isBreak ? 'Pausa' : 'Foco'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-cyan-500/20"
                >
                  <Play size={20} />
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-yellow-500/20"
                >
                  <Pause size={20} />
                  Pausar
                </button>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
              >
                <RotateCcw size={20} />
                Resetar
              </button>
            </div>

            {/* Pomodoro Info */}
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Pomodoros completos hoje:</span>
                <span className="text-white font-bold text-lg">{pomodoroCount}</span>
              </div>
            </div>
          </div>

          {/* Progresso Geral */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-400" size={28} />
              Progresso Geral
            </h2>

            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 font-medium">Aulas Concluídas</span>
                  <span className="text-white font-bold text-lg">
                    {aulasConcluidas} / {totalAulas}
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${progressoGeral}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-green-400 font-bold text-xl">{progressoGeral.toFixed(0)}%</span>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                  <div className="text-slate-400 text-sm mb-1">Total de Aulas</div>
                  <div className="text-2xl font-bold text-white">{totalAulas}</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                  <div className="text-slate-400 text-sm mb-1">Pendentes</div>
                  <div className="text-2xl font-bold text-yellow-400">{aulasPendentes}</div>
                </div>
              </div>

              {/* Resumo por Tema */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Resumo por Tema</h3>
                <div className="space-y-3">
                  {temasEstudo.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <BookOpen className="mx-auto mb-3 text-slate-600" size={48} />
                      <p>Nenhum tema cadastrado ainda</p>
                    </div>
                  ) : (
                    temasEstudo.slice(0, 5).map((tema) => {
                      const materiasTema = materias.filter(m => m.temaId === tema.id)
                      const aulasTema = aulas.filter(a => 
                        materiasTema.some(m => m.id === a.materiaId)
                      )
                      const aulasConcluidasTema = aulasTema.filter(a => a.concluida).length
                      const progressoTema = aulasTema.length > 0 
                        ? (aulasConcluidasTema / aulasTema.length) * 100 
                        : 0

                      return (
                        <div key={tema.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{tema.nome}</span>
                            <span className="text-slate-400 text-sm">
                              {aulasConcluidasTema}/{aulasTema.length}
                            </span>
                          </div>
                          <div className="w-full bg-slate-600/50 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progressoTema}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aulas Recentes */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ClipboardList className="text-blue-400" size={24} />
              Aulas Recentes
            </h2>
            {aulas.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ClipboardList className="mx-auto mb-3 text-slate-600" size={48} />
                <p>Nenhuma aula cadastrada ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aulas.slice(0, 5).map((aula) => {
                  const materia = materias.find(m => m.id === aula.materiaId)
                  const tema = materia ? temasEstudo.find(t => t.id === materia.temaId) : null

                  return (
                    <div
                      key={aula.id}
                      className={`p-4 rounded-xl border transition-all ${
                        aula.concluida
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-slate-700/30 border-slate-600/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {aula.concluida ? (
                              <CheckCircle2 className="text-green-400" size={20} />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-400"></div>
                            )}
                            <h3 className={`font-semibold ${aula.concluida ? 'text-green-400 line-through' : 'text-white'}`}>
                              {aula.titulo}
                            </h3>
                          </div>
                          {aula.descricao && (
                            <p className="text-slate-400 text-sm ml-8 mb-2">{aula.descricao}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-slate-400 ml-8">
                            {tema && (
                              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs">
                                {tema.nome}
                              </span>
                            )}
                            {materia && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs">
                                {materia.nome}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

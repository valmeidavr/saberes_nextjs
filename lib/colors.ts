// Configuração global de cores do sistema
export const colors = {
  primary: 'rgb(41, 41, 68)', // Azul escuro
  primaryDark: 'rgb(30, 30, 51)', // Azul mais escuro
  secondary: 'rgb(238, 183, 0)', // Dourado
  secondaryLight: 'rgb(255, 200, 20)', // Dourado claro
  
  // Classes para Tailwind
  classes: {
    primaryBg: 'bg-[rgb(41,41,68)]',
    primaryText: 'text-[rgb(41,41,68)]',
    primaryBorder: 'border-[rgb(41,41,68)]',
    secondaryBg: 'bg-[rgb(238,183,0)]',
    secondaryText: 'text-[rgb(238,183,0)]',
    secondaryBorder: 'border-[rgb(238,183,0)]',
  }
}

// Função helper para aplicar gradiente primário
export const primaryGradient = 'linear-gradient(135deg, rgb(41,41,68) 0%, rgb(41,41,68) 50%, rgb(30,30,51) 100%)'

// Função helper para aplicar gradiente secundário
export const secondaryGradient = 'linear-gradient(135deg, rgb(238,183,0) 0%, rgb(255,200,20) 100%)'
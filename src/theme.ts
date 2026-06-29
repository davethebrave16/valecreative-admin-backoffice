import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
	palette: {
		primary: {
			main: '#2a6b7c',
			dark: '#1f5a69',
			light: '#3d8a9e',
			contrastText: '#ffffff'
		},
		secondary: {
			main: '#d9ecf0',
			light: '#edf6f9',
			dark: '#1f5a69',
			contrastText: '#1a2e33'
		},
		background: {
			default: '#f8fbfc',
			paper: '#f3f8f9'
		},
		text: {
			primary: '#1a2e33',
			secondary: '#3d5a62'
		},
		success: {
			main: '#3e7d47'
		},
		warning: {
			main: '#c98f2d'
		},
		error: {
			main: '#9b362a'
		},
		grey: {
			50: '#f8fbfc',
			100: '#f3f8f9',
			200: '#d9ecf0',
			300: '#b8d9e0',
			400: '#8cbcc7',
			500: '#5e9aaa',
			600: '#3d5a62',
			700: '#2d4a52',
			800: '#1a2e33',
			900: '#0f1e22'
		}
	},
	typography: {
		fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
		h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 },
		h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.3 },
		h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.4 },
		h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
		h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
		h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
		body1: { fontSize: '1rem', lineHeight: 1.6 },
		body2: { fontSize: '0.875rem', lineHeight: 1.6 }
	},
	shape: {
		borderRadius: 12
	},
	spacing: 8,
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: '#f8fbfc' }
			}
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					background: 'linear-gradient(135deg, #2a6b7c 0%, #1f5a69 100%)',
					boxShadow: '0 4px 20px rgba(42, 107, 124, 0.15)',
					zIndex: 1200,
					color: '#ffffff'
				}
			}
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					fontWeight: 600,
					borderRadius: 8,
					padding: '8px 16px'
				},
				contained: {
					background: 'linear-gradient(135deg, #2a6b7c 0%, #1f5a69 100%)',
					boxShadow: '0 4px 14px rgba(42, 107, 124, 0.25)',
					'&:hover': {
						background: 'linear-gradient(135deg, #1f5a69 0%, #2a6b7c 100%)',
						boxShadow: '0 6px 20px rgba(42, 107, 124, 0.35)',
						transform: 'translateY(-1px)'
					},
					'&:active': { transform: 'translateY(0)' }
				},
				outlined: {
					borderColor: '#2a6b7c',
					color: '#2a6b7c',
					'&:hover': {
						backgroundColor: 'rgba(42, 107, 124, 0.04)',
						borderColor: '#1f5a69'
					}
				}
			}
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
					border: '1px solid rgba(217, 236, 240, 0.8)'
				},
				elevation1: { boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
				elevation2: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
				elevation3: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }
			}
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
					border: '1px solid rgba(217, 236, 240, 0.8)'
				}
			}
		},
		MuiTableContainer: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					overflow: 'hidden',
					boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
				}
			}
		},
		MuiTableHead: {
			styleOverrides: { root: { backgroundColor: '#f8fbfc' } }
		},
		MuiTableCell: {
			styleOverrides: {
				head: {
					fontWeight: 600,
					color: '#1a2e33',
					fontSize: '0.875rem',
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
					borderBottom: '2px solid #d9ecf0',
					padding: '16px 12px'
				},
				body: {
					fontSize: '0.875rem',
					color: '#3d5a62',
					padding: '16px 12px',
					borderBottom: '1px solid #f3f8f9'
				}
			}
		},
		MuiTableRow: {
			styleOverrides: {
				root: {
					'&:hover': { backgroundColor: 'rgba(42, 107, 124, 0.04)' },
					'&:last-child td': { borderBottom: 0 }
				}
			}
		},
		MuiChip: {
			styleOverrides: {
				root: { borderRadius: 8, fontWeight: 500 },
				filled: { backgroundColor: '#2a6b7c', color: '#ffffff' }
			}
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					'& .MuiOutlinedInput-root': {
						borderRadius: 8,
						'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2a6b7c' },
						'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2a6b7c', borderWidth: 2 }
					}
				}
			}
		},
		MuiInputLabel: {
			styleOverrides: {
				root: { fontWeight: 500, color: '#3d5a62' }
			}
		},
		MuiToolbar: {
			styleOverrides: {
				root: { minHeight: '64px !important', padding: '0 24px' }
			}
		},
		MuiDrawer: {
			styleOverrides: {
				paper: {
					borderRadius: '0 16px 16px 0',
					border: 'none',
					boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
				}
			}
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					margin: '4px 8px',
					'&:hover': { backgroundColor: 'rgba(42, 107, 124, 0.08)' },
					'&.Mui-selected': {
						backgroundColor: 'rgba(42, 107, 124, 0.12)',
						'&:hover': { backgroundColor: 'rgba(42, 107, 124, 0.16)' }
					}
				}
			}
		},
		MuiAvatar: {
			styleOverrides: {
				root: { backgroundColor: '#2a6b7c', fontWeight: 600 }
			}
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					'&:hover': { backgroundColor: 'rgba(42, 107, 124, 0.08)' }
				}
			}
		},
		// @ts-ignore – RaLayout is a React-Admin custom component registered in the theme
		RaLayout: {
			styleOverrides: {
				root: {
					'& .RaLayout-appFrame': { marginTop: '64px' }
				}
			}
		}
	}
})

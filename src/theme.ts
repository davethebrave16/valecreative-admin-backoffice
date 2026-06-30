import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
	palette: {
		primary: {
			main: '#2e6b55',
			dark: '#235743',
			light: '#3d8b70',
			contrastText: '#ffffff'
		},
		secondary: {
			main: '#d5ece4',
			light: '#ebf5f0',
			dark: '#235743',
			contrastText: '#1a2e27'
		},
		background: {
			default: '#f7fbf9',
			paper: '#f1f8f4'
		},
		text: {
			primary: '#1a2e27',
			secondary: '#3d5a4e'
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
			50: '#f7fbf9',
			100: '#f1f8f4',
			200: '#d5ece4',
			300: '#b4d9c8',
			400: '#88c0a8',
			500: '#5a9a80',
			600: '#3d5a4e',
			700: '#2d4a3e',
			800: '#1a2e27',
			900: '#0f1e18'
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
				body: { backgroundColor: '#f7fbf9' }
			}
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					background: 'linear-gradient(135deg, #2e6b55 0%, #235743 100%)',
					boxShadow: '0 4px 20px rgba(46, 107, 85, 0.15)',
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
					background: 'linear-gradient(135deg, #2e6b55 0%, #235743 100%)',
					boxShadow: '0 4px 14px rgba(46, 107, 85, 0.25)',
					'&:hover': {
						background: 'linear-gradient(135deg, #235743 0%, #2e6b55 100%)',
						boxShadow: '0 6px 20px rgba(46, 107, 85, 0.35)',
						transform: 'translateY(-1px)'
					},
					'&:active': { transform: 'translateY(0)' }
				},
				outlined: {
					borderColor: '#2e6b55',
					color: '#2e6b55',
					'&:hover': {
						backgroundColor: 'rgba(46, 107, 85, 0.04)',
						borderColor: '#235743'
					}
				}
			}
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
					border: '1px solid rgba(213, 236, 228, 0.8)'
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
					border: '1px solid rgba(213, 236, 228, 0.8)'
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
			styleOverrides: { root: { backgroundColor: '#f7fbf9' } }
		},
		MuiTableCell: {
			styleOverrides: {
				head: {
					fontWeight: 600,
					color: '#1a2e27',
					fontSize: '0.875rem',
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
					borderBottom: '2px solid #d5ece4',
					padding: '16px 12px'
				},
				body: {
					fontSize: '0.875rem',
					color: '#3d5a4e',
					padding: '16px 12px',
					borderBottom: '1px solid #f1f8f4'
				}
			}
		},
		MuiTableRow: {
			styleOverrides: {
				root: {
					'&:hover': { backgroundColor: 'rgba(46, 107, 85, 0.04)' },
					'&:last-child td': { borderBottom: 0 }
				}
			}
		},
		MuiChip: {
			styleOverrides: {
				root: { borderRadius: 8, fontWeight: 500 },
				filled: { backgroundColor: '#2e6b55', color: '#ffffff' }
			}
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					'& .MuiOutlinedInput-root': {
						borderRadius: 8,
						'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2e6b55' },
						'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2e6b55', borderWidth: 2 }
					}
				}
			}
		},
		MuiInputLabel: {
			styleOverrides: {
				root: { fontWeight: 500, color: '#3d5a4e' }
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
					'&:hover': { backgroundColor: 'rgba(46, 107, 85, 0.08)' },
					'&.Mui-selected': {
						backgroundColor: 'rgba(46, 107, 85, 0.12)',
						'&:hover': { backgroundColor: 'rgba(46, 107, 85, 0.16)' }
					}
				}
			}
		},
		MuiAvatar: {
			styleOverrides: {
				root: { backgroundColor: '#2e6b55', fontWeight: 600 }
			}
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					'&:hover': { backgroundColor: 'rgba(46, 107, 85, 0.08)' }
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

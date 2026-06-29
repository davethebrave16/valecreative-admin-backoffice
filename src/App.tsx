import { Admin, CustomRoutes, Resource } from 'react-admin'
import { Route } from 'react-router-dom'
import { dataProvider } from './providers/dataProvider'
import { authProvider } from './providers/authProvider'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { Layout } from './layout/Layout'
import { theme } from './theme'
import { TechniqueList, TechniqueShow, TechniqueCreate, TechniqueEdit } from './resources/techniques'
import './App.css'

function App() {
	return (
		<Admin
			dataProvider={dataProvider}
			authProvider={authProvider}
			loginPage={Login}
			layout={Layout}
			title="Vale Creative Admin"
			theme={theme}
			defaultTheme="light"
		>
			<CustomRoutes>
				<Route path="/" element={<Dashboard />} />
			</CustomRoutes>
			<Resource
				name="techniques"
				list={TechniqueList}
				show={TechniqueShow}
				create={TechniqueCreate}
				edit={TechniqueEdit}
				options={{ label: 'Techniques' }}
			/>
		</Admin>
	)
}

export default App

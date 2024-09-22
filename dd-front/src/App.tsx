import { Routes, Route } from "react-router-dom";
import LoginForm from "./pages/Login"; // Página que quieres mostrar
import CompanyOverview from "./pages/main/Overview"; // Página que quieres mostrar

const App = () => {
	return (
		<Routes>
			{/* <Route path="/" element={<Home />} />  */}
			<Route path="/login" element={<LoginForm />} />
			<Route path="/overview" element={<CompanyOverview />} />
		</Routes>
	);
};

export default App;

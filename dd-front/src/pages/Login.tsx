import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "react-toastify";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// Handle login logic here
		console.log("Login attempted with:", { email, password });
		try {
			const response = await axios.post(
				"http://localhost:5073/auth/login",
				{
					email,
					password,
				},
				{
					headers: {
						accept: "*/*",
						"Content-Type": "application/json",
					},
				}
			);
			if (response.data.message === "Login successful") {
				localStorage.setItem("apiKey", response.data.apiKey);
				localStorage.setItem("userName", response.data.name); // Asegúrate de que el nombre esté disponible en la respuesta
				localStorage.setItem("userEmail", email);
				toast.success("Login successful");
				window.location.href = "/overview";
			}
		} catch (error) {
			toast.error("Login failed");
			console.error(error);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 px-10 mt-4">
					<CardTitle className="text-2xl font-bold text-center mt-4">Sign in to your account</CardTitle>
					<CardDescription className="text-center">Enter your email below to login to your account</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 px-10 mb-4">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" placeholder="valeria.schutz@pe.ey.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
						</div>
						<Button type="submit" className="w-full">
							Sign In
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

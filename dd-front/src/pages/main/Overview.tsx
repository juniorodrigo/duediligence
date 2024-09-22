import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { Company } from "./types";
import CompanyDialog from "./Dialog";

const countries = [
	{ name: "USA", flag: "🇺🇸" },
	{ name: "Canada", flag: "🇨🇦" },
	{ name: "UK", flag: "🇬🇧" },
	{ name: "Germany", flag: "🇩🇪" },
	{ name: "France", flag: "🇫🇷" },
	{ name: "Japan", flag: "🇯🇵" },
	{ name: "Australia", flag: "🇦🇺" },
	{ name: "Brazil", flag: "🇧🇷" },
	{ name: "India", flag: "🇮🇳" },
	{ name: "China", flag: "🇨🇳" },
];

const getRandomColor = () => {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

export default function CompanyOverview() {
	const [companies, setCompanies] = useState<Company[]>([]);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
	const [newCompany, setNewCompany] = useState<Partial<Company>>({});
	const [profileColor] = useState(getRandomColor());
	// ____________

	const fetchCompanies = async () => {
		try {
			const apiKey = localStorage.getItem("apiKey"); // Obtener la apiKey del local storage
			if (!apiKey) {
				console.error("API key not found in localStorage.");
				return;
			}

			const response = await fetch("http://localhost:5073/company", {
				headers: {
					Authorization: `Bearer ${apiKey}`, // Enviar la apiKey en el encabezado
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch companies");
			}

			const data = await response.json();
			setCompanies(data); // Actualizar el estado con los datos de la API
		} catch (error) {
			console.error("Error fetching companies:", error);
		}
	};

	// useEffect para hacer la llamada a la API cuando el componente se monta
	useEffect(() => {
		const apiKey = localStorage.getItem("apiKey");
		if (!apiKey) {
			window.location.href = "/login"; // Redirigir a la página de login
			return; // No renderizar nada más
		}
		fetchCompanies();
	}, []); // Se ejecuta solo una vez cuando el componente se monta

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
	};

	// ____________

	const handleAddCompany = (newCompany: Company) => {
		if (newCompany.companyName && newCompany.taxId) {
			setCompanies([
				...companies,
				{
					...newCompany,
					id: companies.length + 1,
					lastEdited: new Date().toISOString(),
					annualBilling: Number(newCompany.annualBilling) || 0,
					logo: newCompany.logo || "/placeholder.svg",
				} as Company,
			]);
			setNewCompany({}); // Limpia newCompany
			setIsAddDialogOpen(false);
			setCompanies([...companies, newCompany]);
		}
	};

	const handleDeleteCompany = async (id: number) => {
		try {
			const apiKey = localStorage.getItem("apiKey"); // Obtener la apiKey del local storage
			if (!apiKey) {
				console.error("API key not found in localStorage.");
				return;
			}

			// Confirmar antes de proceder con la eliminación
			const confirmation = window.confirm("Are you sure you want to delete this company?");
			if (!confirmation) {
				return;
			}

			// Hacer la petición DELETE a la API
			const response = await fetch(`http://localhost:5073/company/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${apiKey}`, // Enviar la apiKey en el encabezado
				},
			});

			if (response.ok) {
				// Si la eliminación fue exitosa, eliminar del estado
				setCompanies(companies.filter((company) => company.id !== id));
				alert("Company deleted successfully.");
			} else {
				console.error("Failed to delete the company");
			}
		} catch (error) {
			console.error("Error deleting company:", error);
		}
	};

	const handleEditCompany = (updatedCompany: Company) => {
		// Actualiza el estado de las empresas
		setCompanies((prevCompanies) => {
			const index = prevCompanies.findIndex((company) => company.id === updatedCompany.id);
			if (index !== -1) {
				const updatedCompanies = [...prevCompanies];
				updatedCompanies[index] = updatedCompany;
				return updatedCompanies;
			}
			return prevCompanies;
		});
		setIsAddDialogOpen(false);
	};
	const handleLogout = () => {
		// Eliminar los elementos específicos del localStorage
		localStorage.removeItem("apiKey");
		localStorage.removeItem("userName");
		localStorage.removeItem("userEmail");

		// Redirigir a la página de login
		window.location.href = "/login";
	};

	const handleViewDetails = (company: Company) => {
		setSelectedCompany(company);
		setIsDetailsDialogOpen(true);
	};

	if (!localStorage.getItem("apiKey")) {
		return null;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
				<h1 className="text-xl font-light">COMPANY OVERVIEW</h1>
				<div className="flex items-center space-x-2">
					<Button variant="secondary" size="icon" onClick={handleLogout}>
						<LogOut className="h-4 w-4" />
						<span className="sr-only">Logout</span>
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="secondary" size="icon" className="rounded-full">
								<User className="h-4 w-4" />
								<span className="sr-only">User Profile</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<Avatar className="w-8 h-8 mr-2" style={{ backgroundColor: profileColor }}>
									<AvatarFallback>{localStorage.getItem("userName")?.[0] || "J"}</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<span className="font-medium">{localStorage.getItem("userName") || "Junior Rodrigo"}</span>
									<span className="text-xs text-muted-foreground">{localStorage.getItem("userEmail") || "junior@rodrigo.pe"}</span>
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>

			<main className="flex-grow p-6">
				<div className="mb-4">
					<Button
						onClick={() => {
							setSelectedCompany(null);
							setIsAddDialogOpen(true);
						}}
					>
						Add New Company
					</Button>
				</div>

				<Card>
					<Table>
						<TableHeader>
							<TableRow className="">
								<TableHead className="w-[100px]">Logo</TableHead>
								<TableHead>Company Name</TableHead>
								<TableHead>Trade Name</TableHead>
								<TableHead>Country</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{companies.map((company) => (
								<TableRow key={company.id} className="hover:bg-muted/50 transition-colors">
									<TableCell>
										<Avatar>
											<AvatarImage src={company.logo} alt={company.companyName} />
											<AvatarFallback>{company.companyName.substring(0, 2)}</AvatarFallback>
										</Avatar>
									</TableCell>
									<TableCell className="font-medium">{company.companyName}</TableCell>
									<TableCell>{company.tradeName}</TableCell>
									<TableCell>
										<div className="flex items-center">
											<span className="mr-2">{countries.find((c) => c.name === company.country)?.flag}</span>
											{company.country}
										</div>
									</TableCell>
									<TableCell className="text-right ">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button className="" variant="ghost" size="icon" onClick={() => handleViewDetails(company)}>
														<MdOutlineRemoveRedEye className="h-4 w-4 " />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>View Details</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => {
															setSelectedCompany(company);
															setIsAddDialogOpen(true);
														}}
													>
														<Pencil className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Edit Company</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button variant="ghost" size="icon" onClick={() => handleDeleteCompany(company.id)}>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Delete Company</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			</main>

			<CompanyDialog
				open={isAddDialogOpen}
				onClose={() => {
					setIsAddDialogOpen(false);
					setSelectedCompany(null);
				}}
				onSubmit={selectedCompany ? handleEditCompany : handleAddCompany}
				existingCompany={selectedCompany || undefined}
			/>

			<Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Company Details</DialogTitle>
					</DialogHeader>
					{selectedCompany && (
						<Card>
							<CardHeader>
								<CardTitle>{selectedCompany.companyName}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<p>
										<strong>Trade Name:</strong> {selectedCompany.tradeName}
									</p>
									<p>
										<strong>Tax ID:</strong> {selectedCompany.taxId}
									</p>
									<p>
										<strong>Phone:</strong> {selectedCompany.phone}
									</p>
									<p>
										<strong>Email:</strong> {selectedCompany.email}
									</p>
									<p>
										<strong>Website:</strong>{" "}
										<a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
											{selectedCompany.website}
										</a>
									</p>
									<p>
										<strong>Address:</strong> {selectedCompany.address}
									</p>
									<p>
										<strong>Country:</strong> {selectedCompany.country}
									</p>
									<p>
										<strong>Annual Billing:</strong> {formatCurrency(selectedCompany.annualBilling)}
									</p>
									<p>
										<strong>Last Edited:</strong> {new Date(selectedCompany.lastEdited).toLocaleString()}
									</p>
								</div>
							</CardContent>
						</Card>
					)}
					<div className="flex justify-between mt-4">
						<Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
							Close
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								handleDeleteCompany(selectedCompany!.id);
								setIsDetailsDialogOpen(false);
							}}
						>
							Delete Company
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<footer className=" p-4 text-end  font-light">
				<p>&copy; Demo page for EY Interview. Junior Rodrigo</p>
			</footer>
		</div>
	);
}

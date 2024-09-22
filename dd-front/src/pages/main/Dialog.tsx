import React, { useState, useEffect, useRef } from "react";
import { Company } from "./types";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";

interface CompanyDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (company: Company) => void;
	existingCompany?: Company;
}

const CompanyDialog: React.FC<CompanyDialogProps> = ({ open, onClose, onSubmit, existingCompany }) => {
	const [company, setCompany] = useState<Company>(
		existingCompany || {
			id: 0,
			companyName: "",
			tradeName: "",
			taxId: "",
			phone: "",
			email: "",
			website: "",
			address: "",
			country: "",
			annualBilling: 0,
			lastEdited: new Date().toISOString(),
		}
	);

	const [companyType, setCompanyType] = useState<string>("twb");
	const [validationResult, setValidationResult] = useState({
		matchesCount: 0,
		matchesList: [],
	});
	const [showValidationResult, setShowValidationResult] = useState(false);

	const scrollRef = useRef<HTMLDivElement>(null);

	// Efecto para actualizar el estado cuando existingCompany cambia
	useEffect(() => {
		if (open) {
			if (existingCompany) {
				setCompany(existingCompany);
			} else {
				setCompany({
					id: 0,
					companyName: "",
					tradeName: "",
					taxId: "",
					phone: "",
					email: "",
					website: "",
					address: "",
					country: "",
					annualBilling: 0,
					lastEdited: new Date().toISOString(),
				});
			}
		}
	}, [open, existingCompany]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setCompany((prev) => ({ ...prev, [id]: value }));
	};

	const handleSubmit = async () => {
		try {
			const apiKey = localStorage.getItem("apiKey");
			if (!apiKey) {
				console.error("API key not found in localStorage.");
				return;
			}

			const companyWithLogo = { ...company, logo: "" };

			let response;
			if (existingCompany) {
				// Si estamos editando, usa PUT
				response = await fetch(`http://localhost:5073/company/${company.id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify(companyWithLogo),
				});
			} else {
				// Si estamos añadiendo, usa POST
				response = await fetch("http://localhost:5073/company", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify(companyWithLogo),
				});
			}

			if (!response.ok) {
				throw new Error("Failed to save company");
			}

			// const savedCompany = await response.json();

			onSubmit(companyWithLogo); // Pasa el object al padre
			onClose();
		} catch (error) {
			console.error("Error saving company:", error);
		}
	};

	const handleValidate = async () => {
		const entityName = company.companyName;

		if (!entityName) {
			alert("Para validar debe tener un nombre.");
			return;
		}

		const apiKey = localStorage.getItem("apiKey");
		if (!apiKey) {
			console.error("API key not found in localStorage.");
			return;
		}

		const endpoint = companyType === "twb" ? "http://localhost:3000/evaluate-risk/worldbank" : "http://localhost:3000/evaluate-risk/offshoreleaks";

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": apiKey, // Cambiado aquí
				},
				body: JSON.stringify({ entityName }),
			});

			if (!response.ok) {
				setValidationResult({
					matchesCount: 0,
					matchesList: [],
				});
				setShowValidationResult(true);
				throw new Error("Error al validar.");
			}

			const result = await response.json();
			console.log(result);

			setValidationResult(result.data);
			setShowValidationResult(true);
			// Scroll hacia abajo
			if (scrollRef.current) {
				scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		} catch (error) {
			console.error("Error en la validación:", error);
		}
	};

	const handleClose = () => {
		onClose();
		setValidationResult({
			matchesCount: 0,
			matchesList: [],
		});
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{existingCompany ? "Edit Company" : "Add New Company"}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="companyName" className="text-right">
							Company Name
						</Label>
						<Input id="companyName" className="col-span-3" value={company.companyName} onChange={handleChange} />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="tradeName" className="text-right">
							Trade Name
						</Label>
						<Input id="tradeName" className="col-span-3" value={company.tradeName} onChange={handleChange} />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="taxId" className="text-right">
							Tax ID
						</Label>
						<Input id="taxId" className="col-span-3" value={company.taxId} onChange={handleChange} />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="phone" className="text-right">
							Phone
						</Label>
						<Input id="phone" type="tel" className="col-span-3" value={company.phone} onChange={handleChange} />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="email" className="text-right">
							Email
						</Label>
						<Input id="email" type="email" className="col-span-3" value={company.email} onChange={handleChange} />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="website" className="text-right">
							Website
						</Label>
						<Input id="website" type="url" className="col-span-3" value={company.website} onChange={handleChange} />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="address" className="text-right">
							Address
						</Label>
						<Input id="address" className="col-span-3" value={company.address} onChange={handleChange} />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="country" className="text-right">
							Country
						</Label>
						<Input id="country" className="col-span-3" value={company.country} onChange={handleChange} />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="annualBilling" className="text-right">
							Annual Billing
						</Label>
						<Input id="annualBilling" type="number" className="col-span-3" value={company.annualBilling} onChange={(e) => setCompany({ ...company, annualBilling: parseFloat(e.target.value) })} />
					</div>
				</div>
				<Separator className="my-4" />
				<div className="grid grid-cols-4 items-center gap-4">
					<Label htmlFor="companyType" className="text-right">
						Company Type
					</Label>
					<Select onValueChange={setCompanyType} defaultValue={companyType}>
						<SelectTrigger className="col-span-3">
							<SelectValue placeholder="Select company type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="osl">Offshore Leaks Database</SelectItem>
							<SelectItem value="twb">The World Bank</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex justify-between mt-4">
					{!existingCompany && <Button onClick={handleValidate}>Validate</Button>}
					<Button onClick={handleSubmit}>{existingCompany ? "Update Company" : "Add Company"}</Button>
				</div>
				{showValidationResult && validationResult && (
					<Card className="mt-4" ref={scrollRef}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<AlertCircle className="h-5 w-5 text-yellow-500" />
								Blacklist Evaluation
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="mb-2">Matches Found: {validationResult.matchesCount}</p>
							<ScrollArea className="h-[200px] w-full rounded-md border p-4">
								{validationResult.matchesList.map((match, index) => (
									<div key={index} className="mb-4 last:mb-0">
										<h4 className="font-semibold">{match.entityName || match.firmName}</h4>
										<p className="text-sm text-gray-500">Jurisdicción: {match.jurisdiction || match.firmCountry}</p>
										<p className="text-sm text-gray-500">País vinculado: {match.countryLinkedTo || ""}</p>
										<p className="text-sm text-gray-500">Fuente de datos: {match.dataFrom || ""}</p>
										{match.detailsUrl && (
											<a href={match.detailsUrl} className="text-blue-500" target="_blank" rel="noopener noreferrer">
												Ver detalles
											</a>
										)}
									</div>
								))}
							</ScrollArea>
						</CardContent>
					</Card>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default CompanyDialog;

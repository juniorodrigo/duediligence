using System;

namespace dd_back.Models

{
    public class Company
    {
        public int Id { get; set; }
        public string Logo { get; set; }
        public string CompanyName { get; set; }
        public string TradeName { get; set; }
        public string TaxId { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
        public string Address { get; set; }
        public string Country { get; set; }
        public decimal AnnualBilling { get; set; }
        public DateTime LastEdited { get; set; } = DateTime.UtcNow;
    }
}

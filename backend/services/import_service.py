import csv
import io
from uuid import UUID
from typing import List, Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.customer_repository import CustomerRepository
from schemas.domain import CustomerCreate, CustomerResponse

class ImportService:
    def __init__(self, db: AsyncSession):
        self.repo = CustomerRepository(db)

    async def import_customers_from_csv(
        self,
        tenant_id: UUID,
        csv_content: bytes
    ) -> Dict:
        """
        Import customers from CSV content.
        Expected columns: name, phone (optional), email (optional), address (optional), notes (optional)
        
        Returns:
            {
                "success": int,
                "failed": int,
                "errors": [{"row": int, "error": str}],
                "customers": [CustomerResponse]
            }
        """
        results = {
            "success": 0,
            "failed": 0,
            "errors": [],
            "customers": []
        }
        
        try:
            # Decode CSV
            text_content = csv_content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(text_content))
            
            if not reader.fieldnames:
                results["errors"].append({"row": 0, "error": "CSV je prázdny alebo nevalidný."})
                return results
            
            # Validate required column
            if "name" not in reader.fieldnames:
                results["errors"].append({
                    "row": 0,
                    "error": "CSV musí obsahovať stĺpec 'name'. Nájdené: " + ", ".join(reader.fieldnames)
                })
                return results
            
            # Process each row
            for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
                try:
                    # Extract and clean data
                    name = row.get("name", "").strip()
                    phone = row.get("phone", "").strip() or None
                    email = row.get("email", "").strip() or None
                    address = row.get("address", "").strip() or None
                    notes = row.get("notes", "").strip() or None
                    
                    # Validate name (required and non-empty)
                    if not name:
                        results["errors"].append({
                            "row": row_num,
                            "error": "Meno klienta nemôže byť prázdne."
                        })
                        results["failed"] += 1
                        continue
                    
                    # Create customer
                    customer_in = CustomerCreate(
                        name=name,
                        phone=phone,
                        email=email,
                        address=address,
                        notes=notes
                    )
                    
                    customer = await self.repo.create(tenant_id, customer_in)
                    results["customers"].append(CustomerResponse.model_validate(customer))
                    results["success"] += 1
                    
                except ValueError as e:
                    results["errors"].append({
                        "row": row_num,
                        "error": f"Validačná chyba: {str(e)}"
                    })
                    results["failed"] += 1
                except Exception as e:
                    results["errors"].append({
                        "row": row_num,
                        "error": f"Chyba spracovania: {str(e)}"
                    })
                    results["failed"] += 1
        
        except UnicodeDecodeError:
            results["errors"].append({
                "row": 0,
                "error": "CSV súbor nie je v UTF-8 kódovaní. Prosím, uložte ho ako UTF-8."
            })
            return results
        except Exception as e:
            results["errors"].append({
                "row": 0,
                "error": f"Chyba načítania CSV: {str(e)}"
            })
            return results
        
        return results

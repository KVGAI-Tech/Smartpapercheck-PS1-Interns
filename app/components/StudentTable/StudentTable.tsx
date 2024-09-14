
import { StudentData, columns } from "./Columns"
import { DataTable } from "./Data_Table"

async function getData(): Promise<StudentData[]> {
  // Fetch data from your API here.
  return [
    {
      Id: "728ed52f",
      name: "John Doe",
      email: "john.doe@example.com",
      PDFURL: "https://example.com/pdf/123456",
      
    
    },
    {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
      {
        Id: "728ed52f",
        name: "John Doe",
        email: "john.doe@example.com",
        PDFURL: "https://example.com/pdf/123456",
        
      
      },
    // ...
  ]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto p-3 ">
      <DataTable columns={columns} data={data} />
    </div>
  )
}

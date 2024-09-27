
import { StudentData, columns } from "./Columns"
import { DataTable } from "./Data_Table"


interface Demoprops {
  data?:any[]
}

export default  function DemoPage({data}:Demoprops) {
  const datas =  [
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
console.log(data)
  return (
    <div className="container mx-auto p-3 ">
      <DataTable columns={columns} data={datas} />
    </div>
  )
}

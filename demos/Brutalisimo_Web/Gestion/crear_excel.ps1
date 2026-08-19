$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$workbook = $excel.Workbooks.Add()

# 1. Dashboard Tab
$ws4 = $workbook.Worksheets.Item(1)
$ws4.Name = "Dashboard"
$ws4.Cells.Item(1,1) = "INGRESOS TOTALES"
$ws4.Cells.Item(1,2).Formula = "=SUM(Ventas!C:C)"
$ws4.Cells.Item(2,1) = "GASTOS/INVERSION TOTAL"
$ws4.Cells.Item(2,2).Formula = "=SUM(Gastos!C:C)"
$ws4.Cells.Item(3,1) = "GANANCIA NETA"
$ws4.Cells.Item(3,2).Formula = "=B1-B2"
$ws4.Cells.Item(4,1) = "MARGEN DE RENTABILIDAD"
$ws4.Cells.Item(4,2).Formula = "=IF(B2>0, (B3/B2), 0)"
# Formatting
$ws4.Columns.Item(1).ColumnWidth = 25
$ws4.Columns.Item(2).ColumnWidth = 15
$ws4.Range("B1:B3").NumberFormat = "$#,##0.00"
$ws4.Range("B4").NumberFormat = "0.00%"

# 2. Gastos Tab
$ws3 = $workbook.Worksheets.Add($ws4)
$ws3.Name = "Gastos"
$ws3.Cells.Item(1,1) = "Fecha"
$ws3.Cells.Item(1,2) = "Categoria"
$ws3.Cells.Item(1,3) = "Monto Invertido"
$ws3.Cells.Item(1,4) = "Detalles"
$ws3.Rows.Item(1).Font.Bold = $true
$ws3.Columns.Item(3).NumberFormat = "$#,##0.00"

# 3. Ventas Tab
$ws2 = $workbook.Worksheets.Add($ws3)
$ws2.Name = "Ventas"
$ws2.Cells.Item(1,1) = "Fecha"
$ws2.Cells.Item(1,2) = "Prenda Vendida"
$ws2.Cells.Item(1,3) = "Monto Ingresado"
$ws2.Cells.Item(1,4) = "Metodo de Pago"
$ws2.Rows.Item(1).Font.Bold = $true
$ws2.Columns.Item(3).NumberFormat = "$#,##0.00"

# 4. Catalogo Tab
$ws1 = $workbook.Worksheets.Add($ws2)
$ws1.Name = "Catalogo"
$ws1.Cells.Item(1,1) = "Nombre"
$ws1.Cells.Item(1,2) = "Precio"
$ws1.Cells.Item(1,3) = "Foto (URL)"
$ws1.Cells.Item(1,4) = "Estado"
$ws1.Rows.Item(1).Font.Bold = $true

# Cleanup default extra sheets if any
foreach ($ws in $workbook.Worksheets) {
    if ($ws.Name -like "Hoja*") {
        $ws.Delete()
    }
}

$workbook.SaveAs("C:\Users\Usuario\Desktop\Brutalisimo_Web\tienda_prueba\Plantilla_ERP_Lista.xlsx")
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null

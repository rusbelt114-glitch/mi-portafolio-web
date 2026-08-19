/**
 * PROTOCOLO DE SEGURIDAD APLICADO:
 * - A1: Script desvinculado (Standalone).
 * - A5: Solo lectura (getValues).
 * - A6: ID protegido en backend.
 */

// 🔒 REEMPLAZA ESTO CON EL ID DE TU GOOGLE SHEET
const SPREADSHEET_ID = 'PEGAR_AQUI_EL_ID_DE_LA_HOJA';
const SHEET_NAME = 'Hoja 1'; // Nombre de la pestaña en el Excel

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error("No se encontró la hoja con el nombre especificado.");
    }
    
    // Obtener todos los datos (solo lectura)
    const data = sheet.getDataRange().getValues();
    
    // Ignorar la primera fila si son los encabezados (Nombre, Precio, Foto, Estado)
    const headers = data[0];
    const rows = data.slice(1);
    
    const productos = rows.map(row => {
      return {
        nombre: row[0] ? String(row[0]) : '',
        precio: row[1] ? String(row[1]) : '',
        fotoUrl: row[2] ? String(row[2]) : '',
        estado: row[3] ? String(row[3]) : '' 
      };
    }).filter(p => p.nombre !== ''); // Filtrar filas vacías
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      data: productos 
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Manejo de errores genérico (D5)
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: 'Error de conexión con la base de datos.' 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

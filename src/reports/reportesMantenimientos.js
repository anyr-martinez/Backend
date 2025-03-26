const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const maintenanceService = require('../services/maintenanceServices');
const PDFDocumentWithTables = require('pdfkit-table');
const moment = require('moment'); 


//Reporte para fechas de mantenimiento
const generateMaintenanceReportByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;  

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Debe proporcionar un rango de fechas (startDate y endDate).' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const maintenances = await maintenanceService.getMaintenancesByDate(start, end);

        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ message: 'No se encontraron mantenimientos en el rango de fechas proporcionado.' });
        }

        // Crear el directorio si no existe
        const dirPath = path.join(__dirname, '../reports/reportesMantenimientoFecha');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Crear el PDF
        const doc = new PDFDocumentWithTables(PDFDocument);
        const filePath = path.join(dirPath, `reporte_mantenimiento_fecha.pdf`);
        const fileStream = fs.createWriteStream(filePath);
        doc.pipe(fileStream);

        // Insertar el logo
        const logoPath = path.join(__dirname, '../assets/logo triangulo.png');
        doc.image(logoPath, 45, 40, { width: 90 });
 

        // Título del reporte
        const pageWidth = doc.page.width;
        const titleWidth = 400; 
        const titleX = (pageWidth - titleWidth) / 2 + 20; 
        
        doc.font('Helvetica-Bold')
           .fontSize(20)
           .text(`Reporte de Mantenimientos Por Fecha`, titleX, doc.y, { width: titleWidth, align: 'center' });
        
        // Definir la tabla
        const tableData = {
            headers: [
                { label: 'ID', width: 30, align: 'center', valign: 'middle' },
                { label: 'Equipo', width: 140, align: 'left', valign: 'middle' },
                { label: 'N° Serie', width: 60, align: 'left', valign: 'middle' },
                { label: 'Descripción', width: 150, align: 'left', valign: 'middle' },
                { label: 'Fecha Entrada', width: 70, align: 'center', valign: 'middle' },
                { label: 'Fecha Salida', width: 70, align: 'center', valign: 'middle' }
            ],
            rows: maintenances.map(maintenance => [
                String(maintenance.id_mantenimiento), 
                maintenance.equipo_descripcion || 'N/A',  
                maintenance.equipo_numero_serie || 'N/A',
                maintenance.descripcion.substring(0, 50),
                maintenance.fecha_entrada ? moment(maintenance.fecha_entrada).format('DD/MM/YY'): 'Desconocida',
                maintenance.fecha_salida ? moment(maintenance.fecha_salida).format('DD/MM/YY'): 'Desconocida',
            ])
        };
        
        // Establecer el lugar donde empieza la tabla
        doc.x += -80; 
        doc.y += 20;
        
        const options = {
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
            columnSpacing: 5,
            padding: 3,
            lineGap: 4,
            width: 530  
        };
        
    
        // Agregar la tabla
        doc.table(tableData, options);

        // Agregar el total de mantenimientos
        const totalMantenimientos = maintenances.length;
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(14).text(`Total de Mantenimientos Activos: ${totalMantenimientos}`, { align: 'right' });

        // Finalizar el PDF
        doc.end();

        fileStream.on('finish', () => {
            res.status(200).download(filePath, 'Reporte_mantenimiento_fecha.pdf', (err) => {
                if (err) {
                    console.log('Error al descargar el archivo:', err);
                    return res.status(500).json({ message: 'Hubo un error al intentar descargar el archivo.' });
                } else {
                    console.log('Reporte generado correctamente');
                }
            });
        });

        fileStream.on('error', (err) => {
            console.log('Error al escribir el archivo:', err);
            res.status(500).json({ message: 'Hubo un error al generar el reporte.' });
        });

    } catch (error) {
        console.error('Error generando el reporte:', error);
        res.status(500).json({ message: `Hubo un error generando el reporte. Detalles: ${error.message}` });
    }
};


// Reporte de mantenimiento por tipo de equipo
const generateMaintenanceReportByType = async (req, res) => {
    try {
        const { tipoEquipo } = req.query;

        if (!tipoEquipo) {
            return res.status(400).json({ message: 'Debe proporcionar el tipo de equipo en la query (tipoEquipo).' });
        }

        // Filtrar mantenimientos por tipo de equipo
        const maintenances = await maintenanceService.getMaintenancesByEquipmentType(tipoEquipo);

        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ message: `No se encontraron mantenimientos para el tipo de equipo: ${tipoEquipo}.` });
        }

        // Crear el directorio si no existe
        const dirPath = path.join(__dirname, '../reports/reportesMantenimientoTipo');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocumentWithTables(PDFDocument);
        const filePath = path.join(dirPath, `mantenimiento_tipo_Equipo.pdf`);
        const fileStream = fs.createWriteStream(filePath);

        // Pipe el documento al archivo
        doc.pipe(fileStream);

        // Insertar el logo
        const logoPath = path.join(__dirname, '../assets/logo triangulo.png');
        doc.image(logoPath, 55, 60, { width: 100 });



        // Título del reporte
        doc.font('Helvetica-Bold').fontSize(20).text(`Reporte de Mantenimiento por`, { align: 'center' });
        doc.text(`Tipo de Equipo`, { align: 'center' });
        doc.moveDown();
        
        // Definir la tabla con anchos personalizados
        const tableData = {
            headers: [
                { label: 'ID', width: 40, align: 'center', valign: 'middle'},
                { label: 'Equipo', width: 80, align: 'left', valign: 'middle'},
                { label: 'N° Serie', width: 60, align: 'center', valign: 'middle' },
                { label: 'Descripción', width: 150, align: 'left', valign: 'middle'},
                { label: 'Fecha de Entrada', width: 90, align: 'center', valign: 'middle'},
                { label: 'Fecha de Salida', width: 90, align: 'center', valign: 'middle'}
            ],
            rows: maintenances.map(maintenance => [
                String(maintenance.id_mantenimiento), 
                maintenance.equipo_tipo || 'N/A',  
                maintenance.equipo_numero_serie || 'N/A',
                maintenance.descripcion.substring(0, 50),
                maintenance.fecha_entrada ? moment(maintenance.fecha_entrada).format('DD/MM/YY'): 'Desconocida',
                maintenance.fecha_salida ? moment(maintenance.fecha_salida).format('DD/MM/YY'): 'Desconocida',
            ])
        };

         // Establecer el lugar donde empieza la tabla
         doc.x += -20; 
        
         const options = {
             prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
             prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
             columnSpacing: 5,
             padding: 3,
             lineGap: 4,
             width: 530  
        };

        // Crear la tabla en el documento PDF
        doc.table(tableData, options);

         // Agregar el total de mantenimientos
         const totalMantenimientos = maintenances.length;
         doc.moveDown();
         doc.font('Helvetica-Bold').fontSize(14).text(`Total de Mantenimientos Activos: ${totalMantenimientos}`, { align: 'right' });
 
        // Finalizar el documento PDF
        doc.end();

        fileStream.on('finish', () => {
            res.status(200).download
            (filePath, `mantenimiento_tipo_${tipoEquipo}.pdf`, (err) => {
                if (err) {
                    console.log('Error al descargar el archivo:', err);
                    return res.status(500).json({ message: 'Hubo un error al intentar descargar el archivo.' });
                } else {
                    console.log('Reporte generado por tipo de equipo correctamente');
                }
            });
        });

        fileStream.on('error', (err) => {
            console.log('Error al escribir el archivo:', err);
            res.status(500).json({ message: 'Hubo un error al generar el reporte.' });
        });

    } catch (error) {
        console.error('Error generando el reporte:', error);
        res.status(500).json({ message: `Hubo un error generando el reporte. Detalles: ${error.message}` });
    }
};

// Reporte general de mantenimiento
const generateGeneralMaintenanceReport = async (req, res) => {
    try {
        const maintenances = await maintenanceService.getMaintenancesReport();

        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ message: 'No se encontraron mantenimientos.' });
        }

        const dirPath = path.join(__dirname, '../reports/reportesMantenimiento');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const doc = new PDFDocumentWithTables(PDFDocument);
        const filePath = path.join(dirPath, 'mantenimiento_reporte_general.pdf');
        const fileStream = fs.createWriteStream(filePath);

        doc.pipe(fileStream);

         // Insertar el logo
         const logoPath = path.join(__dirname, '../assets/logo triangulo.png');
         doc.image(logoPath, 45, 40, { width: 100 });
 


        // Título del reporte
        doc.font('Helvetica-Bold').fontSize(20).text(``, { align: 'center' });
        doc.text(`Reporte de Mantenimientos `, { align: 'center' });
        doc.moveDown();

        const tableData = {
            headers: [
                { label: 'ID', width: 40, align: 'center', valign: 'middle'},
                { label: 'Equipo', width: 140, align: 'left', valign: 'middle'},
                { label: 'N° Serie', width: 60, align: 'center', valign: 'middle' },
                { label: 'Descripción', width: 150, align: 'left', valign: 'middle'},
                { label: 'Fecha de Entrada', width: 70, align: 'center', valign: 'middle'},
                { label: 'Fecha de Salida', width: 70, align: 'center', valign: 'middle'}
            ],
            rows: maintenances.map(maintenance => [
                String(maintenance.id_mantenimiento), 
                maintenance.equipo_descripcion || 'N/A',  
                maintenance.equipo_numero_serie || 'N/A',
                maintenance.descripcion.substring(0, 50),
                maintenance.fecha_entrada ? moment(maintenance.fecha_entrada).format('DD/MM/YY'): 'Desconocida',
                maintenance.fecha_salida ? moment(maintenance.fecha_salida).format('DD/MM/YY'): 'Desconocida',
            ])
        };

         // Establecer el lugar donde empieza la tabla
        doc.x += -32; 
        const options = {
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
            columnSpacing: 5,
            padding: 3,
            lineGap: 4,
            width: 530  
        };
        
        
        doc.table(tableData, options);

        const totalMantenimientos = maintenances.length;
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(14).text(`Total de Mantenimientos activos: ${totalMantenimientos}`, { align: 'right' });

        doc.end();

        
        fileStream.on('finish', () => {
            res.status(200).download
            (filePath, `mantenimiento_reporte_general.pdf`, (err) => {
                if (err) {
                    console.log('Error al descargar el archivo:', err);
                    return res.status(500).json({ message: 'Hubo un error al intentar descargar el archivo.' });
                } else {
                    console.log('Reporte general generado correctamente');
                }
            });
        });
        fileStream.on('error', (err) => {
            console.log('Error al escribir el archivo:', err);
            res.status(500).json({ message: 'Hubo un error al generar el reporte.' });
        });

    } catch (error) {
        console.error('Error generando el reporte:', error);
        res.status(500).json({ message: `Hubo un error generando el reporte. Detalles: ${error.message}` });
    }
};


module.exports = {
    generateMaintenanceReportByDate,
    generateMaintenanceReportByType,
    generateGeneralMaintenanceReport
}
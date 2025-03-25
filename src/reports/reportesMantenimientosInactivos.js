const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const maintenanceService = require('../services/maintenanceServices');
const PDFDocumentWithTables = require('pdfkit-table');

//REPORTE PARA MANTENIMIENTOS CON FECHA INACTIVOS
const generateMaintenanceReportByDateInactive = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;  

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Debe proporcionar un rango de fechas (startDate y endDate).' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Filtrar mantenimientos por fecha y estado 0 (inactivo)
        const maintenances = await maintenanceService.getMaintenancesByDateInactive(start, end, 0);

        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ message: 'No se encontraron mantenimientos inactivos en el rango de fechas proporcionado.' });
        }

        // Crear el directorio si no existe
        const dirPath = path.join(__dirname, '../reports/reportesMantenimientoFechaInactivos');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Crear el PDF
        const doc = new PDFDocumentWithTables(PDFDocument);
        const filePath = path.join(dirPath, `reporte_mantenimiento_inactivo_fecha.pdf`);
        const fileStream = fs.createWriteStream(filePath);
        doc.pipe(fileStream);

        // Insertar el logo
        const logoPath = path.join(__dirname, '../assets/logo triangulo.png');
        doc.image(logoPath, 40, 60, { width: 96 });

        // Título del reporte
        doc.font('Helvetica-Bold').fontSize(20).text(`Reporte de Mantenimiento Terminados`, { align: 'center' });
        doc.text(`Por Fecha`, { align: 'center' });
        doc.moveDown();
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
                new Date(maintenance.fecha_entrada).toLocaleDateString(),
                maintenance.fecha_salida ? new Date(maintenance.fecha_salida).toLocaleDateString() : 'N/A'
            ])
        };

        // Establecer el lugar donde empieza la tabla
          doc.x += -27; 
          doc.y += 1;
        // Agregar la tabla al documento
        const options = {
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
            columnSpacing: 5,
            padding: 3,
            lineGap: 4,
            width: 530  
        };
        
        doc.table(tableData, options);

        // Agregar el total de mantenimientos inactivos
        const totalMantenimientos = maintenances.length;
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(14).text(`Total de Mantenimientos Inactivos: ${totalMantenimientos}`, { align: 'right' });

        // Finalizar el PDF
        doc.end();

        fileStream.on('finish', () => {
            res.status(200).download(filePath, 'Reporte_mantenimiento_inactivo_fecha.pdf', (err) => {
                if (err) {
                    console.log('Error al descargar el archivo:', err);
                    return res.status(500).json({ message: 'Hubo un error al intentar descargar el archivo.' });
                } else {
                    console.log('Reporte  De fecha inactivos generado correctamente');
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


//REPORTE PARA REPORTE POR TIPO DE EQUIPO INACTIVOS
const generateMaintenanceReportByTypeInactive = async (req, res) => {
    try {
        const { tipoEquipo } = req.query;

        if (!tipoEquipo) {
            return res.status(400).json({ message: 'Debe proporcionar el tipo de equipo en la query (tipoEquipo).' });
        }

        // Filtrar mantenimientos por tipo de equipo
        const maintenances = await maintenanceService.getMaintenancesByEquipmentTypeInactive(tipoEquipo);

        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ message: `No se encontraron mantenimientos para el tipo de equipo: ${tipoEquipo}.` });
        }

        // Crear el directorio si no existe
        const dirPath = path.join(__dirname, '../reports/reportesMantenimientoTipoInactivos');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocumentWithTables(PDFDocument);
        const filePath = path.join(dirPath, `mantenimiento_tipo_Equipo_Inactivo.pdf`);
        const fileStream = fs.createWriteStream(filePath);

        // Pipe el documento al archivo
        doc.pipe(fileStream);

        // Insertar el logo
        const logoPath = path.join(__dirname, '../assets/logo triangulo.png');
        doc.image(logoPath, 55, 60, { width: 100 });



        // Título del reporte
        doc.font('Helvetica-Bold').fontSize(20).text(`Reporte de Mantenimiento por`, { align: 'center' });
        doc.text(`Tipo de Equipos Inactivos`, { align: 'center' });
        doc.moveDown();
        
        // Definir la tabla con anchos personalizados
        const tableData = {
            headers: [
                { label: 'ID', width: 40, align: 'center', valign: 'middle'},
                { label: 'Equipo', width: 80, align: 'left', valign: 'middle'},
                { label: 'N° Serie', width: 60, align: 'left', valign: 'middle' },
                { label: 'Descripción', width: 150, align: 'left', valign: 'middle'},
                { label: 'Fecha de Entrada', width: 90, align: 'center', valign: 'middle'},
                { label: 'Fecha de Salida', width: 90, align: 'center', valign: 'middle'}
            ],
            rows: maintenances.map(maintenance => [
                String(maintenance.id_mantenimiento), 
                maintenance.equipo_tipo || 'N/A',  
                maintenance.equipo_numero_serie || 'N/A',
                maintenance.descripcion.substring(0, 50),
                new Date(maintenance.fecha_entrada).toLocaleDateString(),
                maintenance.fecha_salida ? new Date(maintenance.fecha_salida).toLocaleDateString() : 'N/A'
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
         doc.font('Helvetica-Bold').fontSize(14).text(`Total de Mantenimientos Inactivos: ${totalMantenimientos}`, { align: 'right' });
 
        // Finalizar el documento PDF
        doc.end();

        fileStream.on('finish', () => {
            res.status(200).download
            (filePath, `mantenimiento_tipo_${tipoEquipo}.pdf`, (err) => {
                if (err) {
                    console.log('Error al descargar el archivo:', err);
                    return res.status(500).json({ message: 'Hubo un error al intentar descargar el archivo.' });
                } else {
                    console.log('Reporte generado por tipo de equipo inactivo correctamente');
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

//REPORTE GENERAL DE MANTENIMIENTOS TERMINADOS
const generateGeneralMaintenanceReportInactive = async (req, res) => {
    try {
        // Filtrar todos los mantenimientos inactivos (estado 0)
        const maintenances = await maintenanceService.getMaintenancesReportInactive(0);

        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ message: 'No se encontraron mantenimientos inactivos.' });
        }

        const dirPath = path.join(__dirname, '../reports/reportesMantenimientoInactivos');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const doc = new PDFDocumentWithTables(PDFDocument);
        const filePath = path.join(dirPath, 'mantenimiento_reporte_general_inactivo.pdf');
        const fileStream = fs.createWriteStream(filePath);

        doc.pipe(fileStream);

        // Insertar el logo
        const logoPath = path.join(__dirname, '../assets/logo triangulo.png');
        doc.image(logoPath, 50, 55, { width: 100 });

        // Título del reporte
        doc.font('Helvetica-Bold').fontSize(20).text(`Reporte de Mantenimientos`, { align: 'center' });
        doc.text(`Terminados`, { align: 'center' });
        doc.moveDown();
        

        // Definir la tabla con anchos personalizados
        const tableData = {
            headers: [
                { label: 'ID', width: 40, align: 'center', valign: 'middle'},
                { label: 'Equipo', width: 140, align: 'left', valign: 'middle'},
                { label: 'N° Serie', width: 60, align: 'left', valign: 'middle' },
                { label: 'Descripción', width: 150, align: 'left', valign: 'middle'},
                { label: 'Fecha de Entrada', width: 70, align: 'center', valign: 'middle'},
                { label: 'Fecha de Salida', width: 70, align: 'center', valign: 'middle'}
            ],
            rows: maintenances.map(maintenance => [
                String(maintenance.id_mantenimiento), 
                maintenance.equipo_descripcion || 'N/A',  
                maintenance.equipo_numero_serie || 'N/A',
                maintenance.descripcion.substring(0, 50),
                new Date(maintenance.fecha_entrada).toLocaleDateString(),
                maintenance.fecha_salida ? new Date(maintenance.fecha_salida).toLocaleDateString() : 'N/A'
            ])
        };

        doc.x += -32;
        doc.y += 1;

        // Crear la tabla en el documento
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
        doc.font('Helvetica-Bold').fontSize(14).text(`Total de Mantenimientos Terminados: ${totalMantenimientos}`, { align: 'right' });

        doc.end();

        fileStream.on('finish', () => {
            res.status(200).download(filePath, 'Reporte_mantenimiento_finalizados.pdf', (err) => {
                if (err) {
                    console.log('Error al descargar el archivo:', err);
                    return res.status(500).json({ message: 'Hubo un error al intentar descargar el archivo.' });
                } else {
                    console.log('Reporte de mantenimiento terminados generado correctamente');
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
    generateMaintenanceReportByDateInactive,
    generateMaintenanceReportByTypeInactive,
    generateGeneralMaintenanceReportInactive
}
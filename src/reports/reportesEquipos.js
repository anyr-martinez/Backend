const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const equipmentService = require('../services/equipmentServices');
const PDFDocumentWithTables = require('pdfkit-table'); 
const moment = require('moment'); 

// Reporte de equipos activos en PDF
const generateEquipmentReport = async (req, res) => {
    try {
        // Filtrar solo los equipos activos (estado 1)
        const equipments = await equipmentService.getAllEquipments();

        if (!equipments || equipments.length === 0) {
            return res.status(404).json({ message: 'No hay equipos activos disponibles para generar el reporte.' });
        }

        // Crear el directorio si no existe
        const dirPath = path.join(__dirname, '../reports/reportesEquipos');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });  // Crear directorios recursivamente
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocumentWithTables(PDFDocument);

        // Configurar el nombre del archivo PDF
        const filePath = path.join(dirPath, 'equipos_reporte.pdf');
        const fileStream = fs.createWriteStream(filePath);

        // Pipe el documento al archivo
        doc.pipe(fileStream);

        // Insertar el logo
        const logoPath = path.join(__dirname, '../assets/logo triangulo.png');
        doc.image(logoPath, 72, 42, { width: 95 });
         
        
        // Título del reporte
        doc.font('Helvetica-Bold').fontSize(20).text('Reporte de Equipos Activos', { align: 'center' });
        doc.moveDown();

        // Definir la tabla con anchos personalizados
        const tableData = {
            headers: [
                { label: 'ID', width: 40, align: 'center', valign: 'middle'}, 
                { label: 'Descripción', width: 150, align: 'left', valign: 'middle'},
                { label: 'Tipo', width: 100, align: 'left', valign: 'middle'},
                { label: 'Número de Serie', width: 100, align: 'left', valign: 'middle'},
                { label: 'Fecha de Registro', width: 100, align: 'center', valign: 'middle'}
            ],
            rows: equipments.map(equipment => [
                String(equipment.id_equipo), 
                equipment.descripcion,
                equipment.tipo, 
                equipment.numero_serie,
                equipment.fecha_registro ? moment(equipment.fecha_registro).format('DD/MM/YYYY') : 'Desconocida',
            ])
        };

         // Establecer el lugar donde empieza la tabla
        doc.x += -13; 
        
        // Opciones de la tabla
        const options = {
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
            columnSpacing: 5, 
            padding: 5,
            lineGap: 5 
        };
        

        // Crear la tabla en el documento PDF
        doc.table(tableData, options);

        // Agregar el total de equipos activos al final del reporte
        const totalEquipos = equipments.length;
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(14).text(`Total de Equipos Activos: ${totalEquipos}`, { align: 'right' });

        // Finalizar el documento PDF
        doc.end();

        // Verificar si el archivo existe antes de enviarlo
        fileStream.on('finish', () => {
            res.status(200).download(filePath, 'equipos_reporte.pdf', (err) => {
                if (err) {
                    console.log('Error al descargar el archivo:', err);
                    return res.status(500).json({ message: 'Hubo un error al intentar descargar el archivo.' });
                } else {
                    console.log('Reporte de equipos activos generado correctamente');
                }
            });
        });

        // Manejo de error en la creación del archivo
        fileStream.on('error', (err) => {
            console.log('Error al escribir el archivo:', err);
            res.status(500).json({ message: 'Hubo un error al generar el reporte.' });
        });

    } catch (error) {
        console.error('Error generando el reporte:', error);
        res.status(500).json({ message: `Hubo un error generando el reporte. Detalles: ${error.message}` });
    }
};

// Reporte de equipos inactivos en PDF
const generateInactiveEquipmentReport = async (req, res) => {
    try {
        // Filtrar solo los equipos inactivos (estado 0)
        const equipments = await equipmentService.getInactivesEquipmnent();

        if (!equipments || equipments.length === 0) {
            return res.status(404).json({ message: 'No hay equipos inactivos disponibles para generar el reporte.' });
        }

        // Crear el directorio si no existe
        const dirPath = path.join(__dirname, '../reports/reportesEquiposInactivos');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocumentWithTables(PDFDocument);
        const filePath = path.join(dirPath, 'equipos_inactivos_reporte.pdf');
        const fileStream = fs.createWriteStream(filePath);
        doc.pipe(fileStream);

        // Insertar el logo
        const logoPath = path.join(__dirname, '../assets/logo triangulo.png');
        doc.image(logoPath, 72, 42, { width: 95 });

        // Título del reporte
        doc.font('Helvetica-Bold').fontSize(20).text('Reporte de Equipos Inactivos', { align: 'center' });
        doc.moveDown();

        // Definir la tabla
        const tableData = {
            headers: [
                { label: 'ID', width: 40, align: 'center', valign: 'middle' },
                { label: 'Descripción', width: 150, align: 'left', valign: 'middle' },
                { label: 'Tipo', width: 100, align: 'left', valign: 'middle' },
                { label: 'Número de Serie', width: 100, align: 'left', valign: 'middle' },
                { label: 'Fecha de Registro', width: 100, align: 'center', valign: 'middle' }
            ],
            rows: equipments.map(equipment => [
                String(equipment.id_equipo),
                equipment.descripcion,
                equipment.tipo,
                equipment.numero_serie,
                equipment.fecha_registro ? moment(equipment.fecha_registro).format('DD/MM/YYYY') : 'Desconocida',
            ])
        };

        // Establecer el lugar donde empieza la tabla
        doc.x += -13;

        // Opciones de la tabla
        const options = {
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
            columnSpacing: 5,
            padding: 5,
            lineGap: 5
        };

        // Crear la tabla en el documento PDF
        doc.table(tableData, options);

        // Agregar el total de equipos inactivos al final del reporte
        const totalEquipos = equipments.length;
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(14).text(`Total de Equipos Inactivos: ${totalEquipos}`, { align: 'right' });

        // Finalizar el documento PDF
        doc.end();

        // Verificar si el archivo existe antes de enviarlo
        fileStream.on('finish', () => {
            res.status(200).download(filePath, 'equipos_inactivos_reporte.pdf', (err) => {
                if (err) {
                    console.log('Error al descargar el archivo:', err);
                    return res.status(500).json({ message: 'Hubo un error al intentar descargar el archivo.' });
                } else {
                    console.log('Reporte de equipos inactivos generado correctamente');
                }
            });
        });

        // Manejo de error en la creación del archivo
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
    generateEquipmentReport,
    generateInactiveEquipmentReport
};

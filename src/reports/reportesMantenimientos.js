const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const maintenanceService = require("../services/maintenanceServices");
const Equipment = require("../models/equipmentModel");
const PDFDocumentWithTables = require("pdfkit-table");
const moment = require("moment");
const { Op } = require("sequelize");

//Reporte para fechas de mantenimiento
const generateMaintenanceReportByDate = async (req, res) => {
  try {
    const { startDate, endDate, estado } = req.query;

    // Validación de fechas
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Las fechas de inicio y fin son requeridas.",
      });
    }

    // Validar estado si se proporciona
    const estadosValidos = ["0", "1", "2", "3"];
    if (estado && !estadosValidos.includes(estado) && estado !== "todos") {
      return res.status(400).json({
        message:
          "El estado proporcionado no es válido. Los valores permitidos son: 0 (Pendiente), 1 (En proceso), 2 (Completado), 3(Todos)",
      });
    }
    // Convertir estado a número para que coincida con la lógica del servicio
  const estadoNumerico = estado ? Number(estado) : 3

    // Si el estado es "todos", no se aplica filtro de estado
    let filtroEstado = null;
    if (estado !== "todos") {
      filtroEstado = estado;
    }

    // Llamada al servicio con las fechas y el filtro adecuado (estado si es necesario)
    const maintenances = await maintenanceService.getMaintenancesByDateAndState(
      startDate,
      endDate,
      estadoNumerico,
      filtroEstado
    );


    if (!maintenances || maintenances.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron mantenimientos en el rango de fechas proporcionado.",
      });
    }

    // Crear el directorio si no existe
    const dirPath = path.join(
      __dirname,
      "../reports/reportesMantenimientoFecha"
    );
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Crear el PDF
    const doc = new PDFDocumentWithTables(PDFDocument);
    const filePath = path.join(dirPath, `Reporte_Mantenimiento_Fecha.pdf`);
    const fileStream = fs.createWriteStream(filePath);
    doc.pipe(fileStream);

    // Insertar el logo
    const logoPath = path.join(__dirname, "../assets/logo triangulo.png");
    doc.image(logoPath, 45, 40, { width: 90 });

    // Título del reporte
    const pageWidth = doc.page.width;
    const titleWidth = 400;
    const titleX = (pageWidth - titleWidth) / 2 + 20;

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(`Reporte de Mantenimientos Por Fecha`, titleX, doc.y, {
        width: titleWidth,
        align: "center",
      });

    // Definir la tabla
    const tableData = {
      headers: [
        { label: "ID", width: 30, align: "center", valign: "middle" },
        { label: "Equipo", width: 85, align: "left", valign: "middle" },
        { label: "N° Serie", width: 55, align: "left", valign: "middle" },
        { label: "Descripción", width: 150, align: "left", valign: "middle" },
        {
          label: "Fecha Entrada",
          width: 60,
          align: "center",
          valign: "middle",
        },
        { label: "Fecha Salida", width: 60, align: "center", valign: "middle" },
        { label: "Estado", width: 80, align: "center", valign: "middle" },
      ],
      rows: maintenances.map((maintenance) => [
        String(maintenance.id_mantenimiento),
        maintenance.equipo_descripcion || "N/A",
        maintenance.numero_serie || "N/A",
        maintenance.descripcion.substring(0, 50),
        maintenance.fecha_entrada
          ? moment(maintenance.fecha_entrada).format("DD/MM/YY")
          : "Desconocida",
        maintenance.fecha_salida
          ? moment(maintenance.fecha_salida).format("DD/MM/YY")
          : "Desconocida",
        maintenance.estado === 0
          ? "Pendiente"
          : maintenance.estado === 1
          ? "En Proceso"
          : "Completado",
      ]),
    };

    // Establecer el lugar donde empieza la tabla
    doc.x += -80;
    doc.y += 20;

    const options = {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(12),
      columnSpacing: 5,
      padding: 3,
      lineGap: 4,
      width: 530,
    };

    // Agregar la tabla
    doc.table(tableData, options);

    // Agregar el total de mantenimientos
    const totalMantenimientos = maintenances.length;
    doc.moveDown();
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(`Total de Mantenimientos: ${totalMantenimientos}`, {
        align: "right",
      });

    // Finalizar el PDF
    doc.end();

    fileStream.on("finish", () => {
      res
        .status(200)
        .download(filePath, "Reporte_Mantenimiento_Fecha.pdf", (err) => {
          if (err) {
            console.log("Error al descargar el archivo:", err);
            return res.status(500).json({
              message: "Hubo un error al intentar descargar el archivo.",
            });
          } else {
            console.log("Reporte Por Fechas generado correctamente");
          }
        });
    });

    fileStream.on("error", (err) => {
      console.log("Error al escribir el archivo:", err);
      res.status(500).json({ message: "Hubo un error al generar el reporte." });
    });
  } catch (error) {
    console.error("Error generando el reporte:", error);
    res.status(500).json({
      message: `Hubo un error generando el reporte. Detalles: ${error.message}`,
    });
  }
};

// Reporte de mantenimiento por tipo de equipo y estado
const generateMaintenanceReportByType = async (req, res) => {
  try {
    const { tipoEquipo, estado } = req.query;

    if (!tipoEquipo) {
      return res.status(400).json({
        message:
          "Debe proporcionar el tipo de equipo en la query (tipoEquipo).",
      });
    }

    // Validar estado si se proporciona
    const estadosValidos = ["0", "1", "2", "3"];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        message:
          "El estado proporcionado no es válido. Los valores permitidos son: 0 (Pendiente), 1 (En proceso), 2 (Completado).",
      });
    }
    
   
    // Filtrar mantenimientos por tipo de equipo y estado
    const maintenances =
      await maintenanceService.getMaintenanceReportByTypeAndStatus(
        tipoEquipo,
        estado
      );

    if (!maintenances || maintenances.length === 0) {
      return res.status(404).json({
        message: `No se encontraron mantenimientos para el tipo de equipo: ${tipoEquipo} y estado: ${
          estado || "todos"
        }.`,
      });
    }

    // Crear el directorio si no existe
    const dirPath = path.join(
      __dirname,
      "../reports/reportesMantenimientoTipo"
    );
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Crear un nuevo documento PDF
    const doc = new PDFDocumentWithTables(PDFDocument);
    const filePath = path.join(
      dirPath,
      `Mantenimiento_Tipo_${tipoEquipo}_Estado_${estado || "todos"}.pdf`
    );
    const fileStream = fs.createWriteStream(filePath);

    // Pipe el documento al archivo
    doc.pipe(fileStream);

    // Insertar el logo
    const logoPath = path.join(__dirname, "../assets/logo triangulo.png");
    doc.image(logoPath, 55, 60, { width: 100 });

    // Título del reporte
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(`Reporte de Mantenimiento por`, { align: "center" });

    // Tipo de equipo: (en tamaño 16, en negrita)
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(`Tipo de Equipo: ${tipoEquipo}`, { align: "center" });

    if (estado) {
      // Estado: (en negrita)
      doc
        .font("Helvetica")
        .fontSize(14)
        .text(
          `Estado: ${
            estado === "0"
              ? "Pendiente"
              : estado === "1"
              ? "En Proceso"
              : "Completado"
          }`,
          { align: "center" }
        );
    }

    doc.moveDown();

    // Definir la tabla con anchos personalizados
    const tableData = {
      headers: [
        { label: "ID", width: 30, align: "center", valign: "middle" },
        { label: "Equipo", width: 100, align: "left", valign: "middle" },
        { label: "N° Serie", width: 55, align: "left", valign: "middle" },
        { label: "Descripción", width: 130, align: "left", valign: "middle" },
        {
          label: "Fecha Entrada",
          width: 60,
          align: "center",
          valign: "middle",
        },
        { label: "Fecha Salida", width: 60, align: "center", valign: "middle" },
        { label: "Estado", width: 80, align: "center", valign: "middle" },
      ],
      rows: maintenances.map((maintenance) => [
        String(maintenance.id_mantenimiento),
        maintenance.equipo_descripcion || "N/A",
        maintenance.numero_serie || "N/A",
        maintenance.descripcion.substring(0, 50),
        maintenance.fecha_entrada
          ? moment(maintenance.fecha_entrada).format("DD/MM/YY")
          : "Desconocida",
        maintenance.fecha_salida
          ? moment(maintenance.fecha_salida).format("DD/MM/YY")
          : "Desconocida",
        maintenance.estado === 0
          ? "Pendiente"
          : maintenance.estado === 1
          ? "En Proceso"
          : "Completado",
      ]),
    };

    // Establecer el lugar donde empieza la tabla
    doc.x += -24;

    const options = {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(12),
      columnSpacing: 5,
      padding: 3,
      lineGap: 4,
      width: 530,
    };

    // Crear la tabla en el documento PDF
    doc.table(tableData, options);

    // Agregar el total de mantenimientos
    const totalMantenimientos = maintenances.length;
    doc.moveDown();
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(`Total de Mantenimientos: ${totalMantenimientos}`, {
        align: "right",
      });

    // Finalizar el documento PDF
    doc.end();

    fileStream.on("finish", () => {
      res
        .status(200)
        .download(filePath, `Mantenimiento_Tipo_${tipoEquipo}.pdf`, (err) => {
          if (err) {
            console.log("Error al descargar el archivo:", err);
            return res.status(500).json({
              message: "Hubo un error al intentar descargar el archivo.",
            });
          } else {
            console.log(
              "Reporte generado por tipo de equipo y estado correctamente"
            );
          }
        });
    });

    fileStream.on("error", (err) => {
      console.log("Error al escribir el archivo:", err);
      res.status(500).json({ message: "Hubo un error al generar el reporte." });
    });
  } catch (error) {
    console.error("Error generando el reporte:", error);
    res.status(500).json({
      message: `Hubo un error generando el reporte. Detalles: ${error.message}`,
    });
  }
};

//Reporte general
const generateGeneralMaintenanceReport = async (req, res) => {
  const { estado } = req.query;

  // Validar estado si se proporciona
  const estadosValidos = ["0", "1", "2", "3"];
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({
      message:
        "El estado proporcionado no es válido. Los valores permitidos son: 0 (Pendiente), 1 (En proceso), 2 (Completado), 3 (Todos).",
    });
  }

  // Convertir estado a número para que coincida con la lógica del servicio
  const estadoNumerico = estado ? Number(estado) : 3;

  // Filtrar mantenimientos por estado (si se proporciona) o incluir todos si estado es 3
  const maintenances = await maintenanceService.getGeneralMaintenanceReport(
    estadoNumerico
  );

  if (!maintenances || maintenances.length === 0) {
    return res.status(404).json({
      message: `No se encontraron mantenimientos para el estado: ${
        estado ? estado : "todos"
      }.`,
    });
  }

  // Crear el directorio si no existe
  const dirPath = path.join(
    __dirname,
    "../reports/reportesMantenimientosGenerales"
  );
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Generar el nombre del archivo basado en el estado
  let estadoNombre = "Todos"; // Valor por defecto
  if (estado === "0") {
    estadoNombre = "Pendiente";
  } else if (estado === "1") {
    estadoNombre = "En Proceso";
  } else if (estado === "2") {
    estadoNombre = "Completado";
  }

  // Crear un nuevo documento PDF
  const doc = new PDFDocumentWithTables(PDFDocument);
  const filePath = path.join(
    dirPath,
    `Mantenimiento_General_Estado_${estadoNombre}.pdf`
  );

  const fileStream = fs.createWriteStream(filePath);

  // Pipe el documento al archivo
  doc.pipe(fileStream);

  // Insertar el logo
  const logoPath = path.join(__dirname, "../assets/logo triangulo.png");
  doc.image(logoPath, 55, 50, { width: 100 });

  // Título del reporte
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(`Reporte de Mantenimientos Generales`, { align: "center" });

  if (estado) {
    // Estado: (en negrita)
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(
        `Estado: ${estado === "0" ? "Pendiente" : estado === "1" ? "En Proceso" : estado === "2" ? "Completado" : "Todos"}`,
        { align: "center" }
      );
  }

  doc.moveDown();

  // Crear la tabla de datos
  const tableData = {
    headers: [
      { label: "ID", width: 30, align: "center", valign: "middle" },
      { label: "Equipo", width: 110, align: "left", valign: "middle" },
      { label: "N° Serie", width: 60, align: "left", valign: "middle" },
      { label: "Descripción", width: 150, align: "left", valign: "middle" },
      { label: "Fecha Entrada", width: 60, align: "center", valign: "middle" },
      { label: "Fecha Salida", width: 60, align: "center", valign: "middle" },
      { label: "Estado", width: 80, align: "center", valign: "middle" },
    ],
    rows: maintenances
      .filter(
        (maintenance) => estado === undefined || estado === "3" || maintenance.estado == estado
      )
      .map((maintenance) => [
        String(maintenance.id_mantenimiento),
        maintenance.equipo_descripcion || "N/A",
        maintenance.numero_serie || "N/A",
        maintenance.descripcion.substring(0, 50),
        maintenance.fecha_entrada
          ? moment(maintenance.fecha_entrada).format("DD/MM/YY")
          : "Desconocida",
        maintenance.fecha_salida
          ? moment(maintenance.fecha_salida).format("DD/MM/YY")
          : "Desconocida",
        maintenance.estado === 0
          ? "Pendiente"
          : maintenance.estado === 1
          ? "En Proceso"
          : "Completado",
      ]),
  };

  // Establecer las opciones de la tabla
  doc.x += -41;
  doc.y += 8;
  const options = {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(12),
    columnSpacing: 5,
    padding: 3,
    lineGap: 4,
    width: 530,
  };

  doc.table(tableData, options);

  // Total de mantenimientos
  const totalMantenimientos = maintenances.filter(
    (maintenance) => estado === undefined || estado === "3" || maintenance.estado == estado
  ).length;

  doc.moveDown();
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(`Total de Mantenimientos: ${totalMantenimientos}`, {
      align: "right",
    });

  doc.end();

  fileStream.on("finish", () => {
    res
      .status(200)
      .download(filePath, `Reporte_General_Mantenimientos_Estado_${estadoNombre}.pdf`, (err) => {
        if (err) {
          console.error("Error al intentar descargar el archivo:", err);
          return res.status(500).json({
            message: "Hubo un error al intentar descargar el archivo.",
          });
        } else {
          console.log("Reporte general generado correctamente.");
        }
      });
  });

  fileStream.on("error", (err) => {
    console.error("Error al escribir el archivo:", err);
    res.status(500).json({ message: "Hubo un error al generar el reporte." });
  });
};

module.exports = {
  generateMaintenanceReportByDate,
  generateMaintenanceReportByType,
  generateGeneralMaintenanceReport,
};

"use client";

import {useState} from "react";
import ExcelJS, {Cell} from "exceljs";
import {saveAs} from "file-saver";
import JSZip from "jszip";

interface RowData {
    [key: string]: any;

    __toggle?: boolean;
    __note?: string;
}

interface Header {
    name: string,
    value: string,
    __cell_index: number
}

export default function Report() {
    const [data, setData] = useState<RowData[]>([]);
    const [columns, setColumns] = useState<Header[]>([]);
    const [destinationMilitaryUnit, setDestinationMilitaryUnit] = useState("");
    const [distributionOrderNumber, setDistributionOrderNumber] = useState("");
    const [distributionOrderDate, setDistributionOrderDate] = useState("");
    const [responsiblePersonPosition, setResponsiblePersonPosition] = useState("");
    const [responsiblePersonRank, setResponsiblePersonRank] = useState("");
    const [responsiblePersonName, setResponsiblePersonName] = useState("");
    const [distributionResponsiblePersonPosition, setDistributionResponsiblePersonPosition] = useState("");
    const [distributionResponsiblePersonRank, setDistributionResponsiblePersonRank] = useState("");
    const [distributionResponsiblePersonName, setDistributionResponsiblePersonName] = useState("");

    const sourceColumns: Header[] = [
        {name: "index", value: "№ з/п", __cell_index: -1},
        {name: "rank", value: "В/звання", __cell_index: -1},
        {name: "name", value: "Прізвище, ім'я та по-батькові", __cell_index: -1},
        {name: "birthday", value: "ДН", __cell_index: -1},
        {name: "age", value: "Вік", __cell_index: -1},
        {name: "medicalCommission", value: "Відомість про ВЛК", __cell_index: -1},
        {name: "mobilizationUnit", value: "Ким мобілізований", __cell_index: -1}
    ];

    const report1DestinationColumns: Header[] = [
        {name: "index", value: "№", __cell_index: 1},
        {name: "rank", value: "Військове звання", __cell_index: 2},
        {name: "name", value: "Прізвище ім’я", __cell_index: 3},
        {name: "birthday", value: "Дата народження", __cell_index: 4},
        {name: "age", value: "Вік", __cell_index: 5},
        {name: "medicalCommission", value: "Висновок ВЛК дата, номер", __cell_index: 6},
        {name: "mobilizationUnit", value: "Призваний яким ТЦК та СП", __cell_index: 7},
        {name: "note", value: "Примітка\n(відібраний або відмова у отриманні з зазначеням причини)", __cell_index: 8},
        {
            name: "signature",
            value: "Підпис представника військової частини, яка приймає особивий склад ",
            __cell_index: 9
        }
    ];

    const report2DestinationColumns: Header[] = [
        {name: "index", value: "№", __cell_index: 1},
        {name: "rank", value: "Військове звання", __cell_index: 2},
        {name: "name", value: "Прізвище ім’я", __cell_index: 3},
        {name: "birthday", value: "Дата народження", __cell_index: 4},
        {name: "age", value: "Вік", __cell_index: 5},
        {name: "medicalCommission", value: "Висновок ВЛК дата, номер", __cell_index: 6},
        {name: "mps", value: "МПС", __cell_index: 7},
        {name: "mobilizationUnit", value: "Призваний яким ТЦК та СП", __cell_index: 8},
        {name: "assessment", value: "Оцінка відповідності", __cell_index: 9},
        {name: "note", value: "Причини відмови", __cell_index: 10}
    ];

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        const headers: Header[] = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
            const cellValue = String(cell.value);
            const header = sourceColumns.find(h => h.value === cellValue);
            if (header) {
                header.__cell_index = colNumber;
                headers.push(header);
            }
        });
        const rows: RowData[] = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                return;
            }
            const obj: RowData = {};
            headers.forEach((header) => {
                obj[header.name] = row.getCell(header.__cell_index).value;
            });
            obj.__toggle = true;
            obj.__note = "Відібраний";
            rows.push(obj);
        });
        setColumns(headers);
        setData(rows);
    };

    const handleToggle = (index: number) => {
        setData((prev) =>
            prev.map((row, i) => {
                if (i === index) {
                    const newToggle = !row.__toggle;
                    return {
                        ...row,
                        __toggle: newToggle,
                        __note: newToggle ? "Відібраний" : ""
                    };
                }
                return row;
            })
        );
    };

    const handleTextChange = (index: number, value: string) => {
        setData((prev) =>
            prev.map((row, i) => (i === index ? {...row, __note: value} : row))
        );
    };

    const calculateMergedRowHeight = (text: string, totalWidth: number, fontSize: number = 14) => {
        if (!text) return 15;
        const approxCharPerLine = totalWidth * 1.2;
        const lines = text.split("\n").reduce((acc, line) => acc + Math.ceil(line.length / approxCharPerLine), 0);
        return lines * (fontSize + 2);
    };

    function setCellCenterAlignment(cell: Cell) {
        cell.alignment = {
            ...(cell.alignment || {}),
            horizontal: "center"
        }
    }

    async function generateFirstReport() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Додаток 4", {
            views: [{style: "pageBreakPreview", zoomScale: 80}],
        });
        worksheet.pageSetup = {
            paperSize: 9,
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
                left: 0.5,
                right: 0.5,
                top: 1,
                bottom: 0.5,
                header: 0.3,
                footer: 0.3,
            },
        };
        worksheet.columns = [
            {key: "index", width: 5.89},
            {key: "rank", width: 13.78},
            {key: "name", width: 43.44},
            {key: "birthday", width: 18.11},
            {key: "age", width: 14.22},
            {key: "medicalCommission", width: 34.22},
            {key: "mobilizationUnit", width: 30.78},
            {key: "note", width: 26.22},
            {key: "signature", width: 21.89},
        ];
        worksheet.columns.forEach((col) => {
            col.font = {name: "Times New Roman", size: 14};
        });
        let documentTitleNameRow = worksheet.addRow({
            signature: "Додаток 1"
        });
        documentTitleNameRow.getCell("signature").alignment = {horizontal: "right"};
        worksheet.addRow({
            mobilizationUnit: "ЗАТВЕРДЖУЮ"
        });
        worksheet.addRow({
            mobilizationUnit: "Командир військової частини А4152"
        });
        worksheet.mergeCells(3, 7, 3, 9);
        let commanderRankAndName = worksheet.addRow({
            mobilizationUnit: "полковник",
            note: "Вадим ГАЙДЕЙ"
        });
        commanderRankAndName.getCell("note").alignment = {horizontal: "right"};
        worksheet.addRow({
            mobilizationUnit: "____._______________ 2025 р."
        });
        worksheet.mergeCells(5, 7, 5, 9);
        worksheet.addRow({});
        let documentNameRow = worksheet.addRow({
            index: "АКТ"
        });
        let documentNameRowCell = documentNameRow.getCell("index");
        documentNameRowCell.alignment = {
            horizontal: "center"
        };
        documentNameRowCell.font = {
            ...(documentNameRowCell.font || {}),
            bold: true
        };
        worksheet.mergeCells(7, 1, 7, 9);
        let description = "прийому військовонавченого ресурсу з військової частини А4152 (233 ЦПП) для доукомплектування військової частини ";
        description += destinationMilitaryUnit;
        description += ",\nвідповідно до розпорядження Генерального штабу ЗС України від ";
        let formattedDistributionOrderDate;
        if (distributionOrderDate) {
            let distributionOrderDateObj = new Date(distributionOrderDate);
            formattedDistributionOrderDate = distributionOrderDateObj.toLocaleDateString('uk-UA', {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
        } else {
            formattedDistributionOrderDate = "___.____________.20___ р."
        }
        description += formattedDistributionOrderDate;
        description += " ";
        description += distributionOrderNumber;
        let documentDescriptionRow = worksheet.addRow({
            index: description
        });
        documentDescriptionRow.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
        };
        worksheet.mergeCells(8, 1, 8, 9);
        const totalWidth = worksheet.columns.slice(0, 9).reduce((sum, col) => sum + (col.width || 10), 0);
        documentDescriptionRow.height = calculateMergedRowHeight(description, totalWidth);
        worksheet.addRow({});
        let headerRow = worksheet.addRow({});
        headerRow.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
        };
        report1DestinationColumns.forEach(header => {
            headerRow.getCell(header.name).value = header.value;
        });
        headerRow.eachCell((cell) => {
            cell.border = {
                top: {style: 'thin'},
                left: {style: 'thin'},
                bottom: {style: 'thin'},
                right: {style: 'thin'}
            };
        });
        data.forEach((row) => {
            let dataRow = worksheet.addRow({
                index: row.index,
                rank: row.rank,
                name: row.name,
                birthday: row.birthday,
                age: row.age,
                medicalCommission: row.medicalCommission,
                mobilizationUnit: row.mobilizationUnit,
                note: row.__note,
                signature: ""
            });
            dataRow.alignment = {
                vertical: "middle",
                wrapText: true
            };
            setCellCenterAlignment(dataRow.getCell("index"));
            setCellCenterAlignment(dataRow.getCell("birthday"));
            setCellCenterAlignment(dataRow.getCell("age"));
            setCellCenterAlignment(dataRow.getCell("note"));
            dataRow.eachCell((cell) => {
                cell.border = {
                    top: {style: 'thin'},
                    left: {style: 'thin'},
                    bottom: {style: 'thin'},
                    right: {style: 'thin'}
                };
            });
        });
        worksheet.addRow({});
        worksheet.addRow({});
        let totalCountRow = worksheet.addRow({
            index: "Представлено для вивчення (огляду) " + data.length + " військовослужбовців"
        });
        worksheet.mergeCells(totalCountRow.number, 1, totalCountRow.number, 9);
        let selectedCountRow = worksheet.addRow({
            index: "Відібрано " + data.filter(row => row.__toggle).length + " військовослужбовців"
        });
        worksheet.mergeCells(selectedCountRow.number, 1, selectedCountRow.number, 9);
        worksheet.addRow({});
        let responsiblePersonPositionRow = worksheet.addRow({
            rank: responsiblePersonPosition
        });
        worksheet.mergeCells(responsiblePersonPositionRow.number, 2, responsiblePersonPositionRow.number, 8);
        worksheet.addRow({
            rank: responsiblePersonRank,
            note: responsiblePersonName
        });
        let formattedTodayDate = new Date().toLocaleDateString('uk-UA', {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        let responsiblePersonSignatureDate = worksheet.addRow({
            rank: formattedTodayDate
        });
        worksheet.mergeCells(responsiblePersonSignatureDate.number, 2, responsiblePersonSignatureDate.number, 9);
        worksheet.addRow({});
        let distributionResponsiblePersonPositionRow = worksheet.addRow({
            rank: distributionResponsiblePersonPosition
        });
        worksheet.mergeCells(distributionResponsiblePersonPositionRow.number, 2, distributionResponsiblePersonPositionRow.number, 8);
        worksheet.addRow({
            rank: distributionResponsiblePersonRank,
            note: distributionResponsiblePersonName
        });
        let distributionResponsiblePersonSignatureDate = worksheet.addRow({
            rank: formattedTodayDate
        });
        worksheet.mergeCells(distributionResponsiblePersonSignatureDate.number, 2, distributionResponsiblePersonSignatureDate.number, 9);
        return workbook.xlsx.writeBuffer();
    }

    async function generateSecondReport(isCopy: boolean) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Додаток 4", {
            views: [{style: "pageBreakPreview", zoomScale: 80}],
        });
        worksheet.pageSetup = {
            paperSize: 9,
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
                left: 0.3,
                right: 0.3,
                top: 0.3,
                bottom: 0.3,
                header: 0.3,
                footer: 0.3,
            },
        };
        worksheet.columns = [
            {key: "index", width: 5.89},
            {key: "rank", width: 20.33},
            {key: "name", width: 54.78},
            {key: "birthday", width: 18.11},
            {key: "age", width: 14.22},
            {key: "medicalCommission", width: 34.22},
            {key: "mps", width: 16.33},
            {key: "mobilizationUnit", width: 30.78},
            {key: "assessment", width: 27.12},
            {key: "note", width: 19.0},
        ];
        worksheet.columns.forEach((col) => {
            col.font = {name: "Times New Roman", size: 14};
        });
        let documentTitleNameRow = worksheet.addRow({
            assessment: isCopy ? "Примірник 2" : "Додаток 1"
        });
        documentTitleNameRow.getCell("assessment").alignment = {horizontal: "right"};
        worksheet.addRow({
            mobilizationUnit: "ЗАТВЕРДЖУЮ"
        });
        worksheet.addRow({
            mobilizationUnit: "Командир військової частини А4152"
        });
        worksheet.mergeCells(3, 8, 3, 10);
        let commanderRankAndName = worksheet.addRow({
            mobilizationUnit: "полковник",
            assessment: "Вадим ГАЙДЕЙ"
        });
        commanderRankAndName.getCell("assessment").alignment = {horizontal: "right"};
        worksheet.addRow({
            mobilizationUnit: "____._______________ 2025 р."
        });
        worksheet.mergeCells(5, 8, 5, 9);
        worksheet.addRow({});
        let documentNameRow = worksheet.addRow({
            index: "АКТ"
        });
        let documentNameRowCell = documentNameRow.getCell("index");
        documentNameRowCell.alignment = {
            horizontal: "center"
        };
        documentNameRowCell.font = {
            ...(documentNameRowCell.font || {}),
            bold: true
        };
        worksheet.mergeCells(7, 1, 7, 10);
        let description = "роботи кваліфікаційної комісії військової частини А4152 щодо формування іменних списків на поповнення військової частини ";
        description += destinationMilitaryUnit;
        description += ",\nвідповідно до розпорядження Генерального штабу ЗС України від ";
        let formattedDistributionOrderDate;
        if (distributionOrderDate) {
            let distributionOrderDateObj = new Date(distributionOrderDate);
            formattedDistributionOrderDate = distributionOrderDateObj.toLocaleDateString('uk-UA', {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
        } else {
            formattedDistributionOrderDate = "___.____________.20___ р."
        }
        description += formattedDistributionOrderDate;
        description += " ";
        description += distributionOrderNumber;
        let documentDescriptionRow = worksheet.addRow({
            index: description
        });
        documentDescriptionRow.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
        };
        worksheet.mergeCells(8, 1, 8, 10);
        const totalWidth = worksheet.columns.slice(0, 10).reduce((sum, col) => sum + (col.width || 10), 0);
        documentDescriptionRow.height = calculateMergedRowHeight(description, totalWidth);
        worksheet.addRow({});
        let headerRow = worksheet.addRow({});
        headerRow.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
        };
        report2DestinationColumns.forEach(header => {
            headerRow.getCell(header.name).value = header.value;
        });
        headerRow.eachCell((cell) => {
            cell.border = {
                top: {style: 'thin'},
                left: {style: 'thin'},
                bottom: {style: 'thin'},
                right: {style: 'thin'}
            };
        });
        data.forEach((row) => {
            let dataRow = worksheet.addRow({
                index: row.index,
                rank: row.rank,
                name: row.name,
                birthday: row.birthday,
                age: row.age,
                medicalCommission: row.medicalCommission,
                mps: "задовільний",
                mobilizationUnit: row.mobilizationUnit,
                assessment: row.__toggle ? "відповідає вимогам" : "не відповідає вимогам",
                note: row.__toggle ? "" : row.__note
            });
            dataRow.alignment = {
                vertical: "middle",
                wrapText: true
            };
            setCellCenterAlignment(dataRow.getCell("index"));
            setCellCenterAlignment(dataRow.getCell("birthday"));
            setCellCenterAlignment(dataRow.getCell("age"));
            setCellCenterAlignment(dataRow.getCell("mps"));
            setCellCenterAlignment(dataRow.getCell("assessment"));
            setCellCenterAlignment(dataRow.getCell("note"));
            dataRow.eachCell((cell) => {
                cell.border = {
                    top: {style: 'thin'},
                    left: {style: 'thin'},
                    bottom: {style: 'thin'},
                    right: {style: 'thin'}
                };
            });
        });
        worksheet.addRow({});
        let totalCountRow = worksheet.addRow({
            index: "Підлягало для відбору",
            name: data.length + " військовослужбовців (службових документів на них)"
        });
        worksheet.mergeCells(totalCountRow.number, 1, totalCountRow.number, 2);
        worksheet.mergeCells(totalCountRow.number, 3, totalCountRow.number, 4);
        totalCountRow.getCell("name").alignment = {horizontal: "center", vertical: "middle"};
        let selectedCountRow = worksheet.addRow({
            index: "Відібрано",
            name: data.filter(row => row.__toggle).length + " військовослужбовців (службових документів на них)"
        });
        worksheet.mergeCells(selectedCountRow.number, 1, selectedCountRow.number, 2);
        worksheet.mergeCells(selectedCountRow.number, 3, selectedCountRow.number, 4);
        selectedCountRow.getCell("name").alignment = {horizontal: "center", vertical: "middle"};
        let deniedCountRow = worksheet.addRow({
            index: "Невідібрано",
            name: data.filter(row => !row.__toggle).length + " військовослужбовців (службових документів на них)"
        });
        worksheet.mergeCells(deniedCountRow.number, 1, deniedCountRow.number, 2);
        worksheet.mergeCells(deniedCountRow.number, 3, deniedCountRow.number, 4);
        deniedCountRow.getCell("name").alignment = {horizontal: "center", vertical: "middle"};
        deniedCountRow.addPageBreak();
        worksheet.addRow({});
        let signature1Row = worksheet.addRow({
            rank: "Старший комісії:",
            name: "полковник Дмитро ЛОСІНЕЦЬ",
            birthday: isCopy ? "ОП" : "_______________________"
        });
        signature1Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature1Row.number, 4, signature1Row.number, 5);
        let signature2Row = worksheet.addRow({
            birthday: "(підпис)"
        });
        signature2Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature2Row.number, 4, signature2Row.number, 5);
        let signature3Row = worksheet.addRow({
            rank: "Члени комісії:",
            name: "майор Сергій МАТВІЙЧУК",
            birthday: isCopy ? "ОП" : "_______________________"
        });
        signature3Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature3Row.number, 4, signature3Row.number, 5);
        let signature4Row = worksheet.addRow({
            birthday: "(підпис)"
        });
        signature4Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature4Row.number, 4, signature4Row.number, 5);
        let signature5Row = worksheet.addRow({
            name: "капітан м/с Арсен КОВАЛЬЧУК",
            birthday: isCopy ? "ОП" : "_______________________"
        });
        signature5Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature5Row.number, 4, signature5Row.number, 5);
        let signature6Row = worksheet.addRow({
            birthday: "(підпис)"
        });
        signature6Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature6Row.number, 4, signature6Row.number, 5);
        let signature7Row = worksheet.addRow({
            name: "старший лейтенант Андрій ШЕЛЕСТЮК",
            birthday: isCopy ? "ОП" : "_______________________"
        });
        signature7Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature7Row.number, 4, signature7Row.number, 5);
        let signature8Row = worksheet.addRow({
            birthday: "(підпис)"
        });
        signature8Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature8Row.number, 4, signature8Row.number, 5);
        let signature9Row = worksheet.addRow({
            name: "молодший лейтенант Володимир ФЕДІНЧИК",
            birthday: isCopy ? "ОП" : "_______________________"
        });
        signature9Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature9Row.number, 4, signature9Row.number, 5);
        let signature10Row = worksheet.addRow({
            birthday: "(підпис)"
        });
        signature10Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature10Row.number, 4, signature10Row.number, 5);
        let signature11Row = worksheet.addRow({
            rank: "Секретар комісії:",
            name: "майор Олег КОТИК",
            birthday: isCopy ? "ОП" : "_______________________"
        });
        signature11Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature11Row.number, 4, signature11Row.number, 5);
        let signature12Row = worksheet.addRow({
            birthday: "(підпис)"
        });
        signature12Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature12Row.number, 4, signature12Row.number, 5);
        worksheet.addRow({})
        let signature13Row = worksheet.addRow({
            rank: "Ознайомлення з Актом представника військової частини А7384",
            birthday: "_______________________",
            medicalCommission: distributionResponsiblePersonName
        });
        signature13Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature13Row.number, 2, signature13Row.number, 3);
        worksheet.mergeCells(signature13Row.number, 4, signature13Row.number, 5);
        worksheet.mergeCells(signature13Row.number, 6, signature13Row.number, 7);
        let signature14Row = worksheet.addRow({
            birthday: "(підпис)"
        });
        signature14Row.getCell("birthday").alignment = {horizontal: "center"}
        worksheet.mergeCells(signature14Row.number, 4, signature14Row.number, 5);
        return workbook.xlsx.writeBuffer();
    }

    const handleDownload = async () => {
        const bufferFirstReport = await generateFirstReport();
        const bufferSecondReport = await generateSecondReport(false);
        const bufferSecondReportCopy = await generateSecondReport(true);
        const zip = new JSZip();
        zip.file("Додаток 1 до Алгоритму дій посадових осіб " + new Date().toLocaleDateString() + "(" + destinationMilitaryUnit + ")" + ".xlsx", bufferFirstReport);
        zip.file("Додаток 1 " + new Date().toLocaleDateString() + "(" + destinationMilitaryUnit + ")" + ".xlsx", bufferSecondReport);
        zip.file("Додаток 1 " + new Date().toLocaleDateString() + "(" + destinationMilitaryUnit + ") (примірник)" + ".xlsx", bufferSecondReportCopy);
        const content = await zip.generateAsync({type: "blob"});
        saveAs(content, "Акти " + new Date().toLocaleDateString() + "(" + destinationMilitaryUnit + ").zip");
    };

    return (
        <div className="p-6 mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Акт відбору особового складу
            </h1>

            <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="mb-4 block w-full text-sm text-gray-900 dark:text-gray-100
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-lg file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 dark:file:bg-blue-900
                   file:text-blue-700 dark:file:text-blue-200
                   hover:file:bg-blue-100 dark:hover:file:bg-blue-800
                   cursor-pointer"
            />

            {columns.length > 0 && (
                <div className="overflow-x-auto rounded-lg shadow">
                    <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.name}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider"
                                >
                                    {col.value}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                Відібраний
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider w-[500px]">
                                Причина відмови
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        {data.map((row, i) => (
                            <tr key={i}>
                                {columns.map((col) => (
                                    <td
                                        key={col.name}
                                        className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                                    >
                                        {row[col.name]}
                                    </td>
                                ))}

                                {/* Toggle */}
                                <td className="px-6 py-4">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={row.__toggle}
                                            onChange={() => handleToggle(i)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700
                                      peer-checked:bg-blue-600 relative transition">
                                            <div
                                                className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${
                                                    row.__toggle ? "translate-x-5" : ""
                                                }`}
                                            ></div>
                                        </div>
                                    </label>
                                </td>
                                <td className="px-6 py-4 w-[500px]">
                                    <input
                                        type="text"
                                        value={row.__note}
                                        disabled={row.__toggle}
                                        onChange={(e) => handleTextChange(i, e.target.value)}
                                        className={`px-2 py-1 rounded border text-sm w-full
                                 ${
                                            row.__toggle
                                                ? "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                                : "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        }`}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {columns.length > 0 && (
                <div className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="militaryUnit"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Військова частина
                        </label>
                        <input
                            type="text"
                            id="militaryUnit"
                            value={destinationMilitaryUnit}
                            onChange={(e) => setDestinationMilitaryUnit(e.target.value)}
                            className="w-full px-3 py-2 rounded border text-sm
                   bg-white dark:bg-gray-900
                   text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="orderNumber"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            № розпорядження ГШ
                        </label>
                        <input
                            type="text"
                            id="orderNumber"
                            value={distributionOrderNumber}
                            onChange={(e) => setDistributionOrderNumber(e.target.value)}
                            className="w-full px-3 py-2 rounded border text-sm
                   bg-white dark:bg-gray-900
                   text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="orderDate"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Дата розпорядження ГШ
                        </label>
                        <input
                            type="date"
                            id="orderDate"
                            value={distributionOrderDate}
                            onChange={(e) => setDistributionOrderDate(e.target.value)}
                            className="px-3 py-2 rounded border text-sm
                   bg-white dark:bg-gray-900
                   text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="responsiblePosition"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Посада представника батальйону
                        </label>
                        <input
                            type="text"
                            id="responsiblePosition"
                            value={responsiblePersonPosition}
                            onChange={(e) => setResponsiblePersonPosition(e.target.value)}
                            className="w-full px-3 py-2 rounded border text-sm
                   bg-white dark:bg-gray-900
                   text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="responsibleRank"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Звання представника батальйону
                        </label>
                        <input
                            type="text"
                            id="responsibleRank"
                            value={responsiblePersonRank}
                            onChange={(e) => setResponsiblePersonRank(e.target.value)}
                            className="w-full px-3 py-2 rounded border text-sm
                   bg-white dark:bg-gray-900
                   text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="responsibleName"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Ім'я та прізвище представника батальйону
                        </label>
                        <input
                            type="text"
                            id="responsibleName"
                            value={responsiblePersonName}
                            onChange={(e) => setResponsiblePersonName(e.target.value)}
                            className="w-full px-3 py-2 rounded border text-sm
                   bg-white dark:bg-gray-900
                   text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="disctibutionPosition"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Посада представника підрозділу
                        </label>
                        <input
                            type="text"
                            id="disctibutionPosition"
                            value={distributionResponsiblePersonPosition}
                            onChange={(e) => setDistributionResponsiblePersonPosition(e.target.value)}
                            className="w-full px-3 py-2 rounded border text-sm
                   bg-white dark:bg-gray-900
                   text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div>
                        <label htmlFor="disctibutionRank"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Звання представника підрозділу
                        </label>
                        <input
                            type="text"
                            id="disctibutionRank"
                            value={distributionResponsiblePersonRank}
                            onChange={(e) => setDistributionResponsiblePersonRank(e.target.value)}
                            className="w-full px-3 py-2 rounded border text-sm
                   bg-white dark:bg-gray-900
                   text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="disctibutionName"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Ім'я та прізвище представника підрозділу
                        </label>
                        <input
                            type="text"
                            id="disctibutionName"
                            value={distributionResponsiblePersonName}
                            onChange={(e) => setDistributionResponsiblePersonName(e.target.value)}
                            className="w-full px-3 py-2 rounded border text-sm
                   bg-white dark:bg-gray-900
                   text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <button onClick={handleDownload}
                                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition">
                            Завантажити додаток
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
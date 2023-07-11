<template>
    <v-container fluid>
        <h4 class="table-heading" v-if="tableColumnsData.ematrix">{{ tableColumnsData.ematrix.table.adminProperties.name }}</h4>
        <div class="sub-heading" v-if="tableColumnsData.ematrix">{{ tableColumnsData.ematrix.table.adminProperties.description }}</div>
        <v-toolbar dense>
            <div class="showing-message">Showing 1 - {{ currentFromPageSize }} of {{ tableObjectsList.length }}</div>
            <v-spacer></v-spacer>
            <div>
                <!-- <v-btn small color="primary"><v-icon left>mdi-upload</v-icon> Promote</v-btn>
                <v-btn small color="success"><v-icon left>mdi-download</v-icon> Demote</v-btn> -->
                <v-btn color="info" small @click="exportToExcel">
                    <v-icon left>mdi-file-excel</v-icon>
                    Export Excel
                </v-btn>
            </div>
        </v-toolbar>
        <div class="ag-grid-container" @contextmenu.prevent id="myGrid">
            <ag-grid-vue
                ref="agGrid"
                style="width: 100%; height: 75vh;"
                class="ag-theme-alpine"
                :rowData="tableData"
                :is-quick-filter="true"
                :columnDefs="columnDefs"
                :gridOptions="gridOptions"
                @firstDataRendered="onFirstDataRendered"
                :defaultColDef="defaultColDef"
                animateRows="true"
                :frameworkComponents="frameworkComponents"
                @gridReady="onGridReady"
                :autoSizeColumns="true"
                :rowSelection="rowSelection"
            ></ag-grid-vue>
            <div v-if="showContextMenu" class="context-menu" :style="contextMenuStyle">
                <div class="list-item" @click="handleContextMenuOption('edit')"><v-icon class="pencil-icon">mdi-pencil</v-icon> Edit</div>
                <div class="list-item" @click="handleContextMenuOption('promote')"><v-icon class="pencil-icon">mdi-upload</v-icon> Promote</div>
                <div class="list-item" @click="handleContextMenuOption('demote')"><v-icon class="delete-icon">mdi-download</v-icon> Demote</div>
                <div class="list-item" @click="handleContextMenuOption('delete')"><v-icon class="delete-icon">mdi-delete</v-icon> Delete</div>
                <!-- Add more context menu options as needed -->
            </div>
            <v-btn class="down-arrow" fab dark color="primary" @click="loadMoreRecords">
                <v-icon>mdi-chevron-down</v-icon>
            </v-btn>
        </div>
        <v-dialog v-model="editModalVisible" max-width="1000px">
            <v-card class="edit-modal">
                <v-toolbar dense flat>
                    <v-toolbar-title class="edit-modal-title">Edit Row</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="closeEditModal" class="edit-modal-close-btn">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider></v-divider>
                <v-card-text class="edit-modal-body">
                    <v-form ref="editForm" @submit.prevent="saveRowChanges">
                        <v-container>
                            <v-row dense>
                                <v-col cols="6" class="pe-5" v-for="(value, key) in editableColumns" :key="key">
                                    <template v-if="value.customFieldSetting['Input Type'] === 'text'">
                                        <v-text-field dense outlined v-model="editedRow[value.name]" :label="value.name" required></v-text-field>
                                    </template>
                                    <template v-else-if="value.customFieldSetting['Input Type'] === 'radio'">
                                        <v-label class="radio-label">{{ value.name }}</v-label>
                                        <v-radio-group v-model="editedRow[value.name]" row>
                                            <v-radio
                                                v-for="(option, index) in ['Option 1', 'Option 2', 'Option 3']"
                                                :key="index"
                                                :label="option"
                                                :value="option"
                                            ></v-radio>
                                        </v-radio-group>
                                    </template>
                                    <!-- <template v-else-if="value.customFieldSetting['Input Type'] === 'dropdown'">
                                        <v-select
                                            dense
                                            outlined
                                            v-model="editedRow[value.name]"
                                            :label="value.name"
                                            :items="['Approved', 'Obsolete', 'Create', 'Released', 'Review']"
                                        ></v-select>
                                    </template> -->

                                    <template v-else-if="value.customFieldSetting['Input Type'] === 'checkbox'">
                                        <v-checkbox dense v-model="editedRow[value.name]" :label="value.name"></v-checkbox>
                                    </template>
                                    <template v-else-if="value.customFieldSetting['Input Type'] === 'date'">
                                        <!-- <v-date-picker dense v-model="editedRow[value.name]" :label="value.name"></v-date-picker> -->
                                        <v-menu offset-y>
                                            <template v-slot:activator="{ on }">
                                                <v-text-field
                                                    dense
                                                    outlined
                                                    v-model="editedRow[value.name]"
                                                    :label="value.name"
                                                    readonly
                                                    v-on="on"
                                                ></v-text-field>
                                            </template>
                                            <v-date-picker v-model="editedRow[value.name]"></v-date-picker>
                                        </v-menu>
                                    </template>
                                    <template v-else-if="value.customFieldSetting['Input Type'] === 'dropdown'">
                                        <v-select
                                            dense
                                            outlined
                                            v-model="editedRow[value.name]"
                                            :label="value.name"
                                            :items="['Approved', 'Obsolete', 'Create', 'Released', 'Review']"
                                            multiple
                                            chips
                                            clearable
                                            :search-input.sync="searchInput"
                                            class="custom-multi-select"
                                        ></v-select>
                                    </template>

                                    <!-- <v-text-field dense outlined v-model="editedRow[value.name]" :label="value.name" required></v-text-field> -->
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="edit-modal-actions">
                    <v-btn color="primary" @click="saveRowChanges">Save</v-btn>
                    <v-btn color="error" @click="closeEditModal">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import { AgGridVue } from "ag-grid-vue";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css";
import CustomHeaderComponent from "./customHeader.vue";
import { write as writeExcel, utils as XLSXUtils } from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import {
    filterColumnsBasedOnAccessExpression,
    filterObjectsByFieldSetting,
    getColumnsBasedOnFieldSettingNameAndValue,
    makeMultipleApiCalls
} from "../utils/utils.js";

//import 'ag-grid-enterprise';
export default {
    name: "Table",
    components: {
        "ag-grid-vue": AgGridVue
    },
    data() {
        return {
            agGridApi: null,
            defaultColDef: {
                filter: true,
                sortable: true,
                resizable: true
            },
            gridOptions: {},
            columnDefs: [],
            apiData: [],
            columnList: [],
            tableData: [],
            tableColumnsData: [],
            tableObjectsList: [],
            editableColumns: [],
            showContextMenu: false,
            contextMenuStyle: {
                top: 0,
                left: 0
            },
            editModalVisible: false,
            selectedRow: null,
            editedRow: {},
            rowSelection: "multiple",
            defaultPageSize: 30,
            currentFromPageSize: 0,
            currentToPageSize: 30,
            searchInput: ""
        };
    },
    computed: {
        frameworkComponents() {
            return {
                customHeaderComponent: CustomHeaderComponent // Register custom header component
            };
        }
    },
    mounted() {
        this.fetchApiData();
    },

    methods: {
        onFirstDataRendered(params) {
            params.api.sizeColumnsToFit();
            this.agGridApi = params.api;
        },
        exportToExcel() {
            if (this.agGridApi) {
                // Get the ag-Grid data as an array of objects
                const rowData = [];
                this.agGridApi.forEachNode(node => {
                    rowData.push(node.data);
                });

                // Convert the data to a worksheet
                const worksheet = XLSXUtils.json_to_sheet(rowData);

                // Create a workbook and add the worksheet
                const workbook = XLSXUtils.book_new();
                XLSXUtils.book_append_sheet(workbook, worksheet, "Sheet 1");

                // Generate the Excel file
                const excelBuffer = writeExcel(workbook, {
                    type: "array",
                    bookType: "xlsx"
                });

                // Save the file
                const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                saveAs(blob, "MEPSummary.xlsx");
            }
        },
        onGridReady(params) {
            params.api.sizeColumnsToFit(); // Resize columns to take full width // Register the context menu event listener
            params.api.addEventListener("cellMouseDown", this.showContextMenuHandler);
            this.preventContextMenu();

            this.gridApi = params.api;
            const gridContainer = document.querySelector(".ag-root-wrapper-body");
            const scrollElement = gridContainer.querySelector(".ag-body-viewport");
            scrollElement.addEventListener("scroll", this.handleGridScroll);
            // const gridContainer = this.$refs.agGrid.$el.querySelector(".ag-root-wrapper-body");
            console.log(gridContainer);

            //params.api.addEventListener("bodyScroll", this.handleGridScroll);
        },

        showContextMenuHandler(event) {
            console.log(event);
            this.selectedRow = event.data;
            console.log(this.selectedRow);
            if (event.event.button === 2) {
                event.event.preventDefault();
                this.showContextMenu = true;
                this.contextMenuStyle = {
                    top: `${event.event.clientY}px`,
                    left: `${event.event.clientX}px`
                };
                document.addEventListener("click", this.closeContextMenu);
            }
        },
        preventContextMenu() {
            const gridElement = document.querySelector(".ag-root-wrapper");
            gridElement.addEventListener("contextmenu", event => {
                console.log("coming");
                event.preventDefault();
            });
        },

        closeContextMenu(event) {
            if (!event.target.closest(".context-menu")) {
                // Clicked outside of the context menu, hide it
                this.showContextMenu = false;
                this.contextMenuStyle = {};

                // Remove the click event listener from the document
                document.removeEventListener("click", this.closeContextMenu);
            }
        },

        handleContextMenuOption(option) {
            // Handle the selected context menu option
            console.log("Selected option:", option);
            if (option === "edit") {
                this.editableColumns = getColumnsBasedOnFieldSettingNameAndValue(this.columnList, "editable", true);
                console.log(this.editableColumns);
                // const dateInputTypes = this.editableColumns.filter(column => column.customFieldSetting["Input Type"] === "date");
                // console.log(this.selectedRow);
                // dateInputTypes.forEach(value => {
                //     console.log(value)
                //     const dateObject = new Date(this.selectedRow[value.name]);
                //     console.log(dateObject,this.selectedRow[value.name])
                //     const year = dateObject.getFullYear();
                //     const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
                //     const day = dateObject
                //         .getDate()
                //         .toString()
                //         .padStart(2, "0");
                //     const formattedDate = `${year}-${month}-${day}`;
                //     this.selectedRow[value.name] = formattedDate;
                // });
                this.editedRow = { ...this.selectedRow };
                this.editModalVisible = true;
            }
            // Hide the context menu
            this.showContextMenu = false;
        },
        saveRowChanges() {
            // Validate and save the edited row changes
            if (this.$refs.editForm.validate()) {
                // Save the edited row changes
                console.log("Edited row data:", this.editedRow);

                // Close the edit modal
                this.closeEditModal();
            }
        },

        closeEditModal() {
            // Reset the edited row and hide the edit modal
            this.editedRow = {};
            this.editModalVisible = false;
        },
        fetchApiData() {
            // Initially fetch the data for list of columns by using getTable API and number of objects by using object list API
            const request1 = axios.get("http://localhost:8080/widgets/WidgetService/getTable/MEPSummary");
            const request2 = axios.post("http://localhost:8080/widgets/WidgetService/getObjectData", {
                Function: "getMEPData",
                Program: "emxManfacturingEquivalent",
                RegisteredSuite: "Framework"
            });
            // Make API calls concurrently using Promise.all()
            Promise.all([request1, request2])
                .then(responses => {
                    // Store the response data in the tableColumnsData array
                    const data = responses.map(response => response.data);
                    this.tableColumnsData = data[0];

                    this.columnList = this.tableColumnsData.ematrix.table.columnList.column.map(column => {
                        const fieldSettings = column.fieldSettingList.fieldSetting;
                        column.customFieldSetting = {};
                        // Loop through each field setting and merge it into the mergedFieldSettings object
                        fieldSettings.forEach(setting => {
                            const { fieldSettingName, fieldSettingValue } = setting;
                            column.customFieldSetting[fieldSettingName] = fieldSettingValue;
                        });
                        return column;
                    });
                    console.log("all columns", this.columnList);
                    // filtering the columns based on Access Expression is false, if access expression is false, we are hiding that column in the grid
                    const filteredColumnsBasedOnAccessExpression = filterColumnsBasedOnAccessExpression(this.columnList);
                    console.log("filtered columns with access expression", filteredColumnsBasedOnAccessExpression);
                    // column headers preparation with
                    this.columnDefs = filteredColumnsBasedOnAccessExpression.map(value => {
                        return {
                            headerName: value.name,
                            field: value.name.split(" ").join(""),
                            filter: "agTextColumnFilter",
                            cellRenderer: params => {
                                // put the value in bold
                                return params.value;
                            },
                            minWidth: 200
                        };
                    });
                    console.log(this.columnDefs);
                    // adding checkbox to every row
                    this.columnDefs.unshift({
                        headerName: "",
                        field: "selected",
                        cellRendererFramework: "CheckboxCellRenderer",
                        headerCheckboxSelectionFilteredOnly: true,
                        minWidth: 100,
                        checkboxSelection: true,
                        headerCheckboxSelection: true,
                        cellClass: "ag-checkbox-cell",
                        cellRenderer: "checkboxRenderer"
                    });
                    // list of objects from objects list API
                    this.tableObjectsList = data[1];
                    console.log(this.tableObjectsList);

                    this.getDataForBasedOnColumnWise(this.currentFromPageSize, this.currentToPageSize);
                })
                .catch(error => {
                    console.error(error);
                });
        },
        handleGridScroll(event) {
            const scrollElement = event.target;
            const isAtBottom = scrollElement.scrollTop + scrollElement.clientHeight === scrollElement.scrollHeight;
            console.log(isAtBottom);
            if (isAtBottom) {
                // Load more data or make an API call for additional rows
                // ...

                // Once the API call is completed and new rows are added, ensure the grid updates its layout
                this.gridApi.sizeColumnsToFit();
            }
        },
        async getDataForBasedOnColumnWise(from, to) {
            const getexpressionUrl = "http://localhost:8080/widgets/WidgetService/getExprValue";
            const getColumnValuesUrl = "http://localhost:8080/widgets/WidgetService/getColumnValues";
            const filteredColumnsBasedOnAccessExpression = filterColumnsBasedOnAccessExpression(this.columnList);
            const [columnsWithFunctionFieldSetting, columnsWithoutFunctionFieldSetting] = filterObjectsByFieldSetting(
                filteredColumnsBasedOnAccessExpression,
                "function"
            );
            console.log("columns with function field setting", columnsWithFunctionFieldSetting);
            console.log("columns without function field setting", columnsWithFunctionFieldSetting);
            const apiPostbodiesForFunction = columnsWithFunctionFieldSetting.map(value => {
                return {
                    ColumnName: value.name.split(" ").join(""),
                    Function: value.fieldSettingList.fieldSetting.find(setting => setting.fieldSettingName === "function").fieldSettingValue,
                    RegisteredSuite: value.fieldSettingList.fieldSetting.find(setting => setting.fieldSettingName === "Registered Suite").fieldSettingValue,
                    Program: value.fieldSettingList.fieldSetting.find(setting => setting.fieldSettingName === "program").fieldSettingValue,
                    ObjectIds: this.tableObjectsList.slice(from, to)
                };
            });
            const getDataForIndividualColumns = async (data, from, to) => {
                const extractedObjectIds = this.tableObjectsList.slice(from, to);
                const columnObjects = extractedObjectIds.map(objectId => {
                    return data.map(value => {
                        return {
                            Id: objectId.id,
                            ColumnName: value.name.split(" ").join(""),
                            RegisteredSuite: value.fieldSettingList.fieldSetting.find(setting => setting.fieldSettingName === "Registered Suite")
                                .fieldSettingValue
                        };
                    });
                });
                console.log(columnObjects);
                const responses = await makeMultipleApiCalls(columnObjects.flat(), getexpressionUrl);
                return responses;
            };

            try {
                const MAX_RETRIES = 3;
                let retryCount = 0;
                let failedRequests = [];

                while (retryCount <= MAX_RETRIES) {
                    const { successfulResponses, failed } = await makeMultipleApiCalls(apiPostbodiesForFunction, getColumnValuesUrl);

                    if (failedRequests.length === 0) {
                        // All requests succeeded
                        const mergedData = {};

                        successfulResponses.forEach(column => {
                            column.forEach(item => {
                                const id = item.id;
                                if (!mergedData[id]) {
                                    mergedData[id] = { id };
                                }
                                Object.assign(mergedData[id], item);
                            });
                        });

                        const output = Object.values(mergedData);
                        this.tableData = this.tableData.concat(output);

                        const individualColumnResponse = await getDataForIndividualColumns(columnsWithoutFunctionFieldSetting, from, to);
                        console.log(individualColumnResponse);
                        const updateddata = this.tableData.slice();
                        individualColumnResponse.successfulResponses.forEach(item1 => {
                            const matchingItemIndex = updateddata.findIndex(item2 => item2.id === item1.id);
                            updateddata[matchingItemIndex] = { ...updateddata[matchingItemIndex], ...item1 };
                        });
                        this.tableData = updateddata;

                        this.currentFromPageSize = this.currentToPageSize;
                        this.currentToPageSize = this.currentFromPageSize + this.defaultPageSize;
                        console.log(this.$refs.agGrid);
                        const gridApi = this.$refs.agGrid;
                        const lastRowIndex = this.tableData.length - 1;
                        const lastRowNode = this.gridApi.getRowNode(lastRowIndex);
                        gridApi.ensureNodeVisible(lastRowNode, "middle");
                        break;
                    } else {
                        // Retry failed requests
                        failedRequests = failedRequests.concat(failed);

                        if (retryCount === MAX_RETRIES) {
                            // Reached maximum retries
                            console.error("Maximum retries reached for failed requests");
                            console.error("Failed requests:", failedRequests);

                            // Store the failed object IDs in an array or perform additional error handling as needed
                            // Example: this.failedObjectIds = failedRequests;

                            break;
                        }

                        retryCount++;
                    }
                }
            } catch (error) {
                console.error("Error:", error);
            }
        },

        loadMoreRecords() {
            this.getDataForBasedOnColumnWise(this.currentFromPageSize, this.currentToPageSize);
        }
    }
};
</script>

<style>
.ag-grid-container {
    /* position: relative; */
}
.ag-theme-alpine .ag-root-wrapper {
    border: 1px solid #ccc;
}

.ag-theme-alpine .ag-header-container {
    border-bottom: 1px solid #ccc;
}

.ag-theme-alpine .ag-cell {
    border-right: 1px solid #ccc;
}

.ag-theme-alpine .ag-row {
    border-bottom: 1px solid #ccc;
}

.table-heading {
    color: darkblue;
    font-size: 20px;
    text-align: center;
}

.sub-heading {
    font-size: 14px;
    text-align: center;
    color: #4d4343;
    margin-bottom: 10px;
}
.context-menu {
    position: absolute;
    width: 170px;
    background-color: white;
    border-radius: 1px;
    border: 1px solid #e5e5e5;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.list-item {
    font-size: 14px;
    padding: 7px 10px;
    border-bottom: 1px solid #e5e5e5;
    cursor: pointer;
}
.list-item .pencil-icon {
    font-size: 17px !important;
    color: darkblue !important;
    padding-right: 12px;
}
.list-item .delete-icon {
    font-size: 17px !important;
    color: red !important;
    padding-right: 12px;
}
.list-item:hover {
    background-color: #f5f5f5;
}
.edit-modal {
    border-radius: 4px;
}

.edit-modal-title {
    font-size: 16px !important;
    font-weight: bold;
    color: darkblue;
}

.edit-modal-close-btn {
    color: #757575;
}

.edit-modal-body {
    max-height: 450px;
    overflow-y: auto;
    padding: 20px !important;
}

.edit-modal-actions {
    justify-content: flex-end;
}
.v-text-field input {
    font-size: 13px;
}
.v-label {
    font-size: 14px !important;
    color: black !important;
}
.v-input--selection-controls {
    margin-top: 0 !important;
}
.down-arrow {
    position: absolute !important;
    bottom: 10px;
    right: 10px;
}

.down-arrow i {
    color: #ffffff;
}
.showing-message {
    font-size: 14px;
    color: #555555;
    margin-right: 16px;
}


.custom-multi-select .v-chip.v-size--default {
    border-radius: 16px;
    font-size: 14px;
    height: 23px;
}
</style>

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var wi_contrib_1 = require("wi-studio/app/contrib/wi-contrib");
var FileUploadActivityContribution = (function (_super) {
    __extends(FileUploadActivityContribution, _super);
    function FileUploadActivityContribution(injector, http) {
        var _this = _super.call(this, injector, http) || this;
        _this.http = http;
        _this.validate = function (fieldName, context) {
            var vResult = wi_contrib_1.ValidationResult.newValidationResult();
            if (fieldName !== "filename" && fieldName !== "fileId" && fieldName !== "vectorStoreID") {
                return null;
            }
            var operationField = context.getField("operation");
            var operation = operationField && operationField.value ? String(operationField.value) : "";
            var isMapped = function (inputName) {
                var mappings = context.inputMappings && context.inputMappings.mappings;
                if (!mappings) {
                    return false;
                }
                var entry = mappings["$INPUT['" + inputName + "']"];
                if (!entry) {
                    return false;
                }
                var expr = entry.expression;
                return expr !== null && expr !== undefined && String(expr).trim() !== "";
            };
            var required = [];
            if (operation === "Upload new file") {
                required = ["filename"];
            }
            else if (operation === "Upload new file and Associate to VectorStore") {
                required = ["filename", "vectorStoreID"];
            }
            else if (operation === "Associate existing file to VectorStore") {
                required = ["fileId", "vectorStoreID"];
            }
            else {
                return null;
            }
            var isRequired = required.indexOf(fieldName) >= 0;
            if (isRequired && !isMapped(fieldName)) {
                return vResult.setError("OPENAI-FILE-UPLOAD-1001", "'" + fieldName + "' is required when Operation is '" + operation + "'.");
            }
            return null;
        };
        return _this;
    }
    FileUploadActivityContribution = __decorate([
        wi_contrib_1.WiContrib({}),
        core_1.Injectable(),
        __param(0, core_1.Inject(core_1.Injector)),
        __metadata("design:paramtypes", [Object, http_1.Http])
    ], FileUploadActivityContribution);
    return FileUploadActivityContribution;
}(wi_contrib_1.WiServiceHandlerContribution));
exports.FileUploadActivityContribution = FileUploadActivityContribution;

//# sourceMappingURL=activity.js.map

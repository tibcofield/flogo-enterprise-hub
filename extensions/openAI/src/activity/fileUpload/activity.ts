/*
 * Copyright © 2024 - 2026. Cloud Software Group, Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

import { Observable } from "rxjs/Observable";
import { Injectable, Injector, Inject } from "@angular/core";
import { Http } from "@angular/http";
import {
    WiContrib,
    WiServiceHandlerContribution,
    IValidationResult,
    ValidationResult,
    IActivityContribution
} from "wi-studio/app/contrib/wi-contrib";

@WiContrib({})
@Injectable()
export class FileUploadActivityContribution extends WiServiceHandlerContribution {
    constructor(@Inject(Injector) injector, private http: Http) {
        super(injector, http);
    }

    // value = (fieldName: string, context: IActivityContribution): Observable<any> | any => {
    //     if (fieldName === "filename") {
    //            return "justatest";
    //             }

    //     return null;
    // };



    validate = (fieldName: string, context: IActivityContribution): Observable<IValidationResult> | IValidationResult => {
        const vResult = ValidationResult.newValidationResult();

        // Only validate input mapping fields here.
        if (fieldName !== "filename" && fieldName !== "fileId" && fieldName !== "vectorStoreID") {
            return null;
        }

        const operationField = context.getField("operation");
        const operation = operationField && operationField.value ? String(operationField.value) : "";

        const isMapped = (inputName: string): boolean => {
            const mappings = context.inputMappings && (context.inputMappings as any).mappings;
            if (!mappings) {
                return false;
            }
            const entry = mappings["$INPUT['" + inputName + "']"];
            if (!entry) {
                return false;
            }
            const expr = (entry as any).expression;
            return expr !== null && expr !== undefined && String(expr).trim() !== "";
        };

        // Required fields per operation.
        let required: string[] = [];
        if (operation === "Upload new file") {
            required = ["filename"];
        } else if (operation === "Upload new file and Associate to VectorStore") {
            required = ["filename", "vectorStoreID"];
        } else if (operation === "Associate existing file to VectorStore") {
            required = ["fileId", "vectorStoreID"];
        } else {
            return null;
        }

        const isRequired = required.indexOf(fieldName) >= 0;

        if (isRequired && !isMapped(fieldName)) {
            return vResult.setError("OPENAI-FILE-UPLOAD-1001",
                "'" + fieldName + "' is required when Operation is '" + operation + "'.");
        }

        return null;
    }
     
  
       

       

      
}


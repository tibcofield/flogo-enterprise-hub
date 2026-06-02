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



    // validate = (fieldName: string, context: IActivityContribution): Observable<IValidationResult> | IValidationResult => {
    //     const vResult = ValidationResult.newValidationResult();

    //     if (fieldName === "filename") {
    //         const filename = context.getField("filename");
    //         if (filename && filename.value === "justatest" ){
    //             return vResult.setError("OPENAI-FILE-UPLOAD-1002",
    //                  "The 'filename' field cannot be empty or whitespace or even justatest");

    //         }
    //     }
    
    //     return null;
    // }
     
    //     const val = (n: string): string => {
    //         const f = context.getField(n);
    //         return f && f.value !== null && f.value !== undefined ? String(f.value).trim() : "";
    //     };

    //     if (fieldName === "filename") {
    //         const filename = val("filename");
    //         // if (filename) {
    //             return vResult.setError("OPENAI-FILE-UPLOAD-1002",
    //                  "The 'filename' field cannot be empty or whitespace.");
    //         // }
    //     }

    //     // Cross-field rule for the input mapper: exactly one source of the
    //     // OpenAI file is required. Either `filename` (local file to upload)
    //     // or `fileId` (already-uploaded OpenAI file to reuse) must be mapped.
       

       

      
}


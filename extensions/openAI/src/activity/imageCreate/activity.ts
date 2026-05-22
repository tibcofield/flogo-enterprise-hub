/*
 * Copyright © 2024. TIBCO Software Inc.
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
    IFieldDefinition,
    IActivityContribution,
    IConnectorContribution,
    WiContributionUtils
} from "wi-studio/app/contrib/wi-contrib";

@WiContrib({})
@Injectable()
export class ImageCreateActivityContribution extends WiServiceHandlerContribution {
    constructor(@Inject(Injector) injector, private http: Http) {
        super(injector, http);
    }

    value = (fieldName: string, context: IActivityContribution): Observable<any> | any => {
        if (fieldName === "numberOfImages") {
            const modelField: IFieldDefinition = context.getField("model");
            if (modelField && modelField.value === "dall-e-3") {
                return 1;
            }
        }
        return null;
    }

    validate = (fieldName: string, context: IActivityContribution): Observable<IValidationResult> | IValidationResult => {
        let vResult = ValidationResult.newValidationResult();
        if (fieldName === "numberOfImages") {
            const modelField: IFieldDefinition = context.getField("model");
            const nField: IFieldDefinition = context.getField("numberOfImages");
            if (modelField.value === "gpt-image-1" && Number(nField.value) !== 1) {
                return vResult.setError("OPENAI-IMG-CREATE-1001",
                    "When model is 'gpt-image-1', Number of Images must be 1.");
            }
        }
        return null;
    }
}

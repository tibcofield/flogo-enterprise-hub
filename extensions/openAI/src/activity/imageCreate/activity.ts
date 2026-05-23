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
        if (fieldName === "size") {
            const model = String(context.getField("model").value || "");
            const family =
                (!model || model === "dall-e-2") ? "dall-e-2" :
                (model === "dall-e-3") ? "dall-e-3" :
                (model.indexOf("gpt-image-2") === 0) ? "gpt-image-2" :
                (model.indexOf("gpt-image") === 0) ? "gpt-image" : "";

            switch (family) {
                case "dall-e-2":
                    return ["", "256x256", "512x512", "1024x1024"];
                case "dall-e-3":
                    return ["", "1024x1024", "1024x1792", "1792x1024"];
                case "gpt-image":
                case "gpt-image-2":
                    return ["", "1024x1024", "1024x1536", "1536x1024", "auto"];
                default:
                    return [""];
            }
        }
        return null;
    }

    visible = (fieldName: string, context: IActivityContribution): Observable<boolean> | boolean => {
        if (fieldName === "style") {
            const model = String(context.getField("model").value || "");
            return model === "dall-e-3";
        }
        return true;
    }


    validate = (fieldName: string, context: IActivityContribution): Observable<IValidationResult> | IValidationResult => {
        const vResult = ValidationResult.newValidationResult();

        // Helper: classify the model into a family.
        const modelFamily = (m: string): "dall-e-2" | "dall-e-3" | "gpt-image" | "gpt-image-2" | "" => {
            if (!m || m === "dall-e-2") return "dall-e-2";
            if (m === "dall-e-3") return "dall-e-3";
            if (m.indexOf("gpt-image-2") === 0) return "gpt-image-2";
            if (m.indexOf("gpt-image") === 0) return "gpt-image";
            return "";
        };

        const model = String(context.getField("model").value || "");
        const family = modelFamily(model);
        const val = (n: string): string => {
            const f = context.getField(n);
            return f && f.value !== null && f.value !== undefined ? String(f.value) : "";
        };

        // -------------------- numberOfImages --------------------
        if (fieldName === "numberOfImages") {
            const raw = context.getField("numberOfImages").value;
            const n = Number(raw);
            if (raw !== null && raw !== undefined && String(raw) !== "") {
                if (!Number.isFinite(n) || n < 1 || n > 10) {
                    return vResult.setError("OPENAI-IMG-CREATE-1001",
                        "Number of Images must be between 1 and 10.");
                }
                if (family === "dall-e-3" && n !== 1) {
                    return vResult.setError("OPENAI-IMG-CREATE-1002",
                        "When model is 'dall-e-3', Number of Images must be 1.");
                }
            }
        }

        // -------------------- size --------------------
        if (fieldName === "size") {
            const size = val("size");
            if (size !== "") {
                const dalle2 = ["256x256", "512x512", "1024x1024"];
                const dalle3 = ["1024x1024", "1024x1792", "1792x1024"];
                const gptStd = ["1024x1024", "1024x1536", "1536x1024", "auto"];

                if (family === "dall-e-2" && dalle2.indexOf(size) < 0) {
                    return vResult.setError("OPENAI-IMG-CREATE-1010",
                        "For 'dall-e-2', Size must be one of: " + dalle2.join(", ") + ".");
                }
                if (family === "dall-e-3" && dalle3.indexOf(size) < 0) {
                    return vResult.setError("OPENAI-IMG-CREATE-1011",
                        "For 'dall-e-3', Size must be one of: " + dalle3.join(", ") + ".");
                }
                if (family === "gpt-image" && gptStd.indexOf(size) < 0) {
                    return vResult.setError("OPENAI-IMG-CREATE-1012",
                        "For gpt-image models, Size must be one of: " + gptStd.join(", ") + ".");
                }
                if (family === "gpt-image-2") {
                    // Standard values OR arbitrary WxH (multiples of 16, AR 1:3-3:1, <= 3840x2160).
                    if (gptStd.indexOf(size) < 0) {
                        const m = /^(\d+)x(\d+)$/.exec(size);
                        if (!m) {
                            return vResult.setError("OPENAI-IMG-CREATE-1013",
                                "Size must be a standard preset or an arbitrary WxH value.");
                        }
                        const w = parseInt(m[1], 10);
                        const h = parseInt(m[2], 10);
                        if (w % 16 !== 0 || h % 16 !== 0) {
                            return vResult.setError("OPENAI-IMG-CREATE-1014",
                                "For 'gpt-image-2', custom width and height must be multiples of 16.");
                        }
                        if (w > 3840 || h > 2160) {
                            return vResult.setError("OPENAI-IMG-CREATE-1015",
                                "For 'gpt-image-2', custom size must not exceed 3840x2160.");
                        }
                        const ar = w / h;
                        if (ar < 1 / 3 || ar > 3) {
                            return vResult.setError("OPENAI-IMG-CREATE-1016",
                                "For 'gpt-image-2', custom aspect ratio must be between 1:3 and 3:1.");
                        }
                    }
                }
            }
        }

        // -------------------- quality --------------------
        if (fieldName === "quality") {
            const q = val("quality");
            if (q !== "") {
                const dalle2 = ["standard", "auto"];
                const dalle3 = ["standard", "hd", "auto"];
                const gpt = ["low", "medium", "high", "auto"];
                if (family === "dall-e-2" && dalle2.indexOf(q) < 0) {
                    return vResult.setError("OPENAI-IMG-CREATE-1020",
                        "For 'dall-e-2', Quality must be empty, 'standard' or 'auto'.");
                }
                if (family === "dall-e-3" && dalle3.indexOf(q) < 0) {
                    return vResult.setError("OPENAI-IMG-CREATE-1021",
                        "For 'dall-e-3', Quality must be one of: " + dalle3.join(", ") + ".");
                }
                if ((family === "gpt-image" || family === "gpt-image-2") && gpt.indexOf(q) < 0) {
                    return vResult.setError("OPENAI-IMG-CREATE-1022",
                        "For gpt-image models, Quality must be one of: " + gpt.join(", ") + ".");
                }
            }
        }

        // -------------------- style (dall-e-3 only) --------------------
        if (fieldName === "style") {
            const s = val("style");
            if (s !== "" && family !== "dall-e-3") {
                return vResult.setError("OPENAI-IMG-CREATE-1030",
                    "Style is only supported by 'dall-e-3'.");
            }
        }

        // -------------------- responseFormat (dall-e-2/3 only, exclusive with outputFormat) --------------------
        if (fieldName === "responseFormat") {
            const rf = val("responseFormat");
            const of = val("outputFormat");
            if (rf !== "") {
                if (family !== "dall-e-2" && family !== "dall-e-3") {
                    return vResult.setError("OPENAI-IMG-CREATE-1040",
                        "Response Format is only supported by 'dall-e-2' and 'dall-e-3'.");
                }
                if (of !== "") {
                    return vResult.setError("OPENAI-IMG-CREATE-1041",
                        "Response Format and Output Format are mutually exclusive.");
                }
            }
        }

        // -------------------- outputFormat (gpt-image* only, exclusive with responseFormat) --------------------
        if (fieldName === "outputFormat") {
            const of = val("outputFormat");
            const rf = val("responseFormat");
            if (of !== "") {
                if (family !== "gpt-image" && family !== "gpt-image-2") {
                    return vResult.setError("OPENAI-IMG-CREATE-1050",
                        "Output Format is only supported by gpt-image models.");
                }
                if (rf !== "") {
                    return vResult.setError("OPENAI-IMG-CREATE-1051",
                        "Output Format and Response Format are mutually exclusive.");
                }
            }
        }

        // -------------------- background (gpt-image* only; transparent requires png/webp) --------------------
        if (fieldName === "background") {
            const bg = val("background");
            const of = val("outputFormat");
            if (bg !== "") {
                if (family !== "gpt-image" && family !== "gpt-image-2") {
                    return vResult.setError("OPENAI-IMG-CREATE-1060",
                        "Background is only supported by gpt-image models.");
                }
                if (bg === "transparent" && of !== "" && of !== "png" && of !== "webp") {
                    return vResult.setError("OPENAI-IMG-CREATE-1061",
                        "Background 'transparent' requires Output Format 'png' or 'webp' (or empty).");
                }
            }
        }

        // -------------------- outputCompression (gpt-image* only, 1-100, needs webp/jpeg) --------------------
        if (fieldName === "outputCompression") {
            const raw = context.getField("outputCompression").value;
            if (raw !== null && raw !== undefined && String(raw) !== "") {
                const n = Number(raw);
                if (n !== 0) {
                    if (family !== "gpt-image" && family !== "gpt-image-2") {
                        return vResult.setError("OPENAI-IMG-CREATE-1070",
                            "Output Compression is only supported by gpt-image models.");
                    }
                    if (!Number.isFinite(n) || n < 1 || n > 100) {
                        return vResult.setError("OPENAI-IMG-CREATE-1071",
                            "Output Compression must be between 1 and 100.");
                    }
                    const of = val("outputFormat");
                    if (of !== "" && of !== "webp" && of !== "jpeg") {
                        return vResult.setError("OPENAI-IMG-CREATE-1072",
                            "Output Compression only applies when Output Format is 'webp' or 'jpeg'.");
                    }
                }
            }
        }

        // -------------------- moderation (gpt-image* only) --------------------
        if (fieldName === "moderation") {
            const md = val("moderation");
            if (md !== "" && family !== "gpt-image" && family !== "gpt-image-2") {
                return vResult.setError("OPENAI-IMG-CREATE-1080",
                    "Moderation is only supported by gpt-image models.");
            }
        }

        return null;
    }
}

import { Maybe } from "../types/Maybe";
import { ZoomSettings } from "../types/ZoomSettings";
import CumulationReference from "./CumulationReference";

/**
 * Focus list: 
 * 1. Focus on absolute transform first.
 * 2. Then on relative.
 * 3. Then refine the API.
 */

export class PetiteTransform{
    private zoomSettings: ZoomSettings;

    /**
     * TODO @khongchai implement built-in easing.
     */
    private easeFactor: number;

    /**
     * The total cumulated transform that's ever happened.
     */
    private cumulationReference: CumulationReference;

    private getTransformReference: () => DOMMatrix;

    private eventTarget: EventTarget;

    /**
     * @param transformReference the matrix to apply all transformations to. If provided, the matrix may be shared with other
     * libraries. If null or undefined, one will be provided by this library.
     */
    constructor({
        transformReference,
        devicePixelRatio = 1,
        easeFactor = 1,
        managePan = true,
        manageZoom = true,
        eventTarget = document,
        zoomSettings = {
            max: Number.POSITIVE_INFINITY,
            min: Number.NEGATIVE_INFINITY
        },
    }: {
        transformReference: Maybe<() => DOMMatrix>,
        devicePixelRatio: number,
        easeFactor: number,
        managePan: true,
        manageZoom: true,
        eventTarget: EventTarget;
        zoomSettings: ZoomSettings
    }) {
        this.eventTarget = eventTarget;
        this.zoomSettings = zoomSettings;
        this.easeFactor = easeFactor;
        this.cumulationReference = new CumulationReference({
            transformationUpdateCallback: () => {
                // TODO update logic
                return {
                    absolute: new DOMMatrix(),
                    relative: new DOMMatrix()
                };
            }
        });
        if (transformReference) {
            this.getTransformReference = transformReference;
        } else {
            // Copy the cumulated transform to a new dommatrix object.
            const { mat: { a, d, e, f } } = this.cumulationReference.total;
            this.getTransformReference = () => new DOMMatrix([
                a, 0, 0, d, e, f
            ]);

            // set the cumulation ref to an identity matrix
            // this.cumulationReference.setTotalChange({});

            this.eventTarget = eventTarget;

        }
    };

}
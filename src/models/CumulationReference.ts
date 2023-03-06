/**
 * The dMat is the incoming change.
 */
export type TransformationUpdateCallback = (dMat: DOMMatrix) => {
    absolute: DOMMatrix,
    relative: DOMMatrix
}

export type TransformType = "relative" | "absolute";

export default class CumulationReference {
    /**
     * Total relative position
     * dx, dy, dz
     */
    change: {
        mat: DOMMatrix
    };
    /**
     * Total absolute position
     * x, y, z
     */
    total: {
        mat: DOMMatrix,
    };

    transformationUpdateCallback: TransformationUpdateCallback;

    constructor({ transformationUpdateCallback }: { transformationUpdateCallback: TransformationUpdateCallback }) {
        this.transformationUpdateCallback = transformationUpdateCallback;
    };

    /**
     * Discards old changes and use this change 
     */
    setTotalChange(mat: DOMMatrix) {
        this.change.mat = mat;
    }

    /**
     * Like `setTransform`, but instead of replacing the values, increment them instead.
     *
     * This is to cache all values in-between frames when called from an animation loop.
     */
    incrementChange(mat: DOMMatrix) {
        const { a, d, e, f } = mat;
        // TODO this can also be in the new matrix extension.
        if (a != d) throw new Error("a != d. This is a 2D operation. a must be equal to d");
        this.change.mat.translate(a, e, f);
    }

    // TODO @khongchai come back and use the new copyWith method here.
    /**
    * Spoonfeed the client only once and then close until more values are set.
    * This is to prevent any translation method in an animation frame from applying the
    * same transform twice. If you need the same transform in multiple places, store it in a variable somewhere.
    */
    getTransform(type: TransformType): DOMMatrix {
        const { a, d, e, f } = this.change.mat;
        const returnVal = new DOMMatrix([a, 0, 0, d, e, f]);

        this.transformationUpdateCallback(returnVal);

        this.change.mat = new DOMMatrix();

        return type === "relative" ? returnVal : this.total.mat;
    }
}
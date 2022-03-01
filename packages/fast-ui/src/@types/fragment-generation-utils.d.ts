declare module 'text-fragments-polyfill/dist/fragment-generation-utils' {
    export function generateFragment(selection: Selection, date?: Date): FragmentResult

    export interface FragmentResult { status: GenerateFragmentStatus, fragment?: TextFragment }

    export interface TextFragment {
        textStart:string
        textEnd?:string
        prefix?:string
        suffix?:string
    }

    export enum GenerateFragmentStatus {
        SUCCESS,            // A fragment was generated.
        INVALID_SELECTION,  // The selection provided could not be used.
        AMBIGUOUS,  // No unique fragment could be identified for this selection.
        TIMEOUT,    // Computation could not complete in time.
        EXECUTION_FAILED  // An exception was raised during generation.
    }
}

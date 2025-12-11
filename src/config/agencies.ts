
/**
 * Registry of supported NetFile agencies (Jurisdictions).
 * Add new counties/cities here to enable automatic syncing.
 */

export interface Agency {
    id: string;          // Our internal ID/Code (can be whatever)
    name: string;        // Display Name (e.g. "Riverside County")
    type: 'CITY' | 'COUNTY';
    netfileId: string;   // The Agency ID assigned by NetFile (e.g. "RIV" - Hypothetical)
    enabled: boolean;
}

export const AGENCIES: Agency[] = [
    {
        id: 'riv_co',
        name: 'Riverside County',
        type: 'COUNTY',
        netfileId: 'RIV', // Verify exact code with NetFile/Docs
        enabled: true
    },
    {
        id: 'la_co',
        name: 'Los Angeles County',
        type: 'COUNTY',
        netfileId: 'LA', // Verify exact code
        enabled: false // Disabled until verified
    },
    {
        id: 'indio_city',
        name: 'Indio',
        type: 'CITY',
        netfileId: 'IND', // Verify exact code
        enabled: false
    }
];

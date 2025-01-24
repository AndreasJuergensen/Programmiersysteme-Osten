/// <reference lib="webworker" />

import { Dfg } from '../classes/dfg/dfg';
import { PetriNet } from '../classes/petrinet/petri-net';

addEventListener('message', ({ data }) => {
    const petriNet = data as PetriNet; // Replace `any` with the correct type if available

    console.log('Web Worker received PetriNet:', petriNet);

    // Perform heavy computation
    petriNet.getDFGs().forEach((dfg: Dfg) => {
        dfg.startProcessing();
    });

    // Notify the main thread that processing is complete
    postMessage('done');
});

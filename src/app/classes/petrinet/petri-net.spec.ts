import { Dfg, DfgBuilder } from '../dfg/dfg';
import { PetriNet } from './petri-net';
import { PetriNetArcs } from './petri-net-arcs';
import { PetriNetTransitions } from './petri-net-transitions';
import { Places } from './places';

describe('A Petrinet', () => {
    it('DFG is a base case', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .addFromPlayArc('A')
            .addToStopArc('A')
            .build();

        const result: boolean = sut.isBaseCase();

        expect(result).toBeTrue();
    });

    it('DFG is not a base case', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();

        const result: boolean = sut.isBaseCase();

        expect(result).toBeFalse();
    });

    it('DFG is a base case and base activity name is', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .addFromPlayArc('A')
            .addToStopArc('A')
            .build();

        const sutIsBaseCase: boolean = sut.isBaseCase();
        const result: string = sut.getBaseActivityName();

        expect(sutIsBaseCase).toBeTrue();
        expect(result).toEqual('A');
    });

    it('input place id is "input" after initialization', () => {
        const dfg: Dfg = new DfgBuilder()
            .createActivity('A')
            .addFromPlayArc('A')
            .addToStopArc('A')
            .build();

        const sut: PetriNet = new PetriNet(dfg);
        const result: string = sut.inputPlace.id;

        expect(result).toEqual('input');
    });

    it('output place id is "output" after initialization', () => {
        const dfg: Dfg = new DfgBuilder()
            .createActivity('A')
            .addFromPlayArc('A')
            .addToStopArc('A')
            .build();

        const sut: PetriNet = new PetriNet(dfg);
        const result: string = sut.outputPlace.id;

        expect(result).toEqual('output');
    });

    it('is updated by exclusive cut', () => {
        const originDFG: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('A')
            .addFromPlayArc('Z')
            .addToStopArc('B')
            .addToStopArc('Y')
            .addArc('A', 'B')
            .addArc('Z', 'Y')
            .build();
        const subDFG1: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();
        const subDFG2: Dfg = new DfgBuilder()
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('Z')
            .addToStopArc('Y')
            .addArc('Z', 'Y')
            .build();

        const sut: PetriNet = new PetriNet(originDFG).updateByExclusiveCut(
            originDFG,
            subDFG1,
            subDFG2,
        );

        const expectedPlaces: Places = new Places()
            .addInputPlace()
            .addOutputPlace();
        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.input,
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.addDFG(subDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.addPlace().getPlaceByID('p2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.output,
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.addDFG(subDFG2).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.getPlaceByID('p2'),
            );

        expect(sut.places).toEqual(expectedPlaces);
        expect(sut.transitions).toEqual(expectedTransitions);
        expect(sut.arcs).toEqual(expectedArcs);
    });

    it('update by sequence cut', () => {
        const originDFG: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('A')
            .addToStopArc('Y')
            .addArc('A', 'B')
            .addArc('B', 'Z')
            .addArc('Z', 'Y')
            .build();
        const subDFG1: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();
        const subDFG2: Dfg = new DfgBuilder()
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('Z')
            .addToStopArc('Y')
            .addArc('Z', 'Y')
            .build();

        const sut: PetriNet = new PetriNet(originDFG).updateBySequenceCut(
            originDFG,
            subDFG1,
            subDFG2,
        );

        const expectedPlaces: Places = new Places()
            .addInputPlace()
            .addOutputPlace();
        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.input,
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.addDFG(subDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.addDFG(subDFG2).getLastTransition(),
                expectedPlaces.addPlace().getPlaceByID('p2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.output,
            );
        expectedArcs
            .addTransitionToPlaceArc(
                expectedArcs.getNextTransition(
                    expectedPlaces.getPlaceByID('p1'),
                ),
                expectedPlaces.addPlace().getPlaceByID('p3'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p3'),
                expectedTransitions.getLastTransition(),
            );

        expect(sut.places).toEqual(expectedPlaces);
        expect(sut.transitions).toEqual(expectedTransitions);
        expect(sut.arcs).toEqual(expectedArcs);
    });

    it('update by parallel cut', () => {
        const originDFG: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('A')
            .addFromPlayArc('Z')
            .addToStopArc('B')
            .addToStopArc('Y')
            .addArc('A', 'B')
            .addArc('A', 'Z')
            .addArc('A', 'Y')
            .addArc('B', 'Z')
            .addArc('B', 'Y')
            .addArc('Z', 'Y')
            .addArc('Z', 'A')
            .addArc('Z', 'B')
            .addArc('Y', 'A')
            .addArc('Y', 'B')
            .build();
        const subDFG1: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();
        const subDFG2: Dfg = new DfgBuilder()
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('Z')
            .addToStopArc('Y')
            .addArc('Z', 'Y')
            .build();

        const sut: PetriNet = new PetriNet(originDFG).updateByParallelCut(
            originDFG,
            subDFG1,
            subDFG2,
        );

        const expectedPlaces: Places = new Places()
            .addInputPlace()
            .addOutputPlace();
        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.input,
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.addDFG(subDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.addPlace().getPlaceByID('p2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.output,
            );
        expectedArcs
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p3'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p3'),
                expectedTransitions.addDFG(subDFG2).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.addPlace().getPlaceByID('p4'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p4'),
                expectedTransitions.getTransitionByID('t2'),
            );

        expect(sut.places).toEqual(expectedPlaces);
        expect(sut.transitions).toEqual(expectedTransitions);
        expect(sut.arcs).toEqual(expectedArcs);
    });

    it('update by loop cut', () => {
        const originDFG: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('Z')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .addArc('A', 'Z')
            .addArc('Z', 'B')
            .build();
        const subDFG1: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();
        const subDFG2: Dfg = new DfgBuilder()
            .createActivity('Z')
            .addFromPlayArc('Z')
            .addToStopArc('Z')
            .build();

        const sut: PetriNet = new PetriNet(originDFG).updateByLoopCut(
            originDFG,
            subDFG1,
            subDFG2,
        );

        const expectedPlaces: Places = new Places()
            .addInputPlace()
            .addOutputPlace();

        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');

        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.input,
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.addDFG(subDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.addPlace().getPlaceByID('p2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.output,
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.addDFG(subDFG2).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.getPlaceByID('p1'),
            );

        expect(sut.places).toEqual(expectedPlaces);
        expect(sut.transitions).toEqual(expectedTransitions);
        expect(sut.arcs).toEqual(expectedArcs);
    });

    it('update by flower fall through', () => {
        const originDFG: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('A')
            .addFromPlayArc('Z')
            .addToStopArc('B')
            .addToStopArc('Y')
            .addArc('A', 'B')
            .addArc('Z', 'Y')
            .addArc('B', 'Y')
            .build();
        const flowerDFG1: Dfg = new DfgBuilder()
            .createActivity('A')
            .addFromPlayArc('A')
            .addToStopArc('A')
            .build();
        const flowerDFG2: Dfg = new DfgBuilder()
            .createActivity('B')
            .addFromPlayArc('B')
            .addToStopArc('B')
            .build();
        const flowerDFG3: Dfg = new DfgBuilder()
            .createActivity('Z')
            .addFromPlayArc('Z')
            .addToStopArc('Z')
            .build();
        const flowerDFG4: Dfg = new DfgBuilder()
            .createActivity('Y')
            .addFromPlayArc('Y')
            .addToStopArc('Y')
            .build();

        const fallThroughDFGs: Dfg[] = [
            flowerDFG1,
            flowerDFG2,
            flowerDFG3,
            flowerDFG4,
        ];

        const sut: PetriNet = new PetriNet(originDFG).updateByFlowerFallThrough(
            originDFG,
            fallThroughDFGs,
        );

        const expectedPlaces: Places = new Places()
            .addInputPlace()
            .addOutputPlace();
        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.input,
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p1'),
            );
        expectedTransitions
            .addDFG(originDFG)
            .transitions.splice(
                expectedTransitions.transitions.indexOf(
                    expectedTransitions.getLastTransition(),
                ),
                1,
            );
        expectedPlaces
            .addPlace()
            .places.splice(
                expectedPlaces.places.indexOf(expectedPlaces.getLastPlace()),
                1,
            );
        expectedArcs
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.output,
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.addDFG(flowerDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.addDFG(flowerDFG2).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.addDFG(flowerDFG3).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.addDFG(flowerDFG4).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.getPlaceByID('p1'),
            );

        expect(sut.places).toEqual(expectedPlaces);
        expect(sut.transitions).toEqual(expectedTransitions);
        expect(sut.arcs).toEqual(expectedArcs);
    });
});

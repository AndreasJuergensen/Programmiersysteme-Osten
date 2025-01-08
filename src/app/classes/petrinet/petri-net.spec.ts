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
                .addDFG(originDFG)
                .createTransition('')
                .addDFG(subDFG1)
                .createTransition('')
                .addDFG(subDFG2);
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.input,
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.output,
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(expectedPlaces.getPlaceByID('p1'), subDFG1)
            .addTransitionToPlaceArc(
                subDFG1,
                expectedPlaces.addPlace().getPlaceByID('p2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addPlaceToTransitionArc(expectedPlaces.getPlaceByID('p1'), subDFG2)
            .addTransitionToPlaceArc(
                subDFG2,
                expectedPlaces.getPlaceByID('p2'),
            );
        expectedTransitions.removeDFG(originDFG);

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
                .addDFG(originDFG)
                .addDFG(subDFG1)
                .addDFG(subDFG2);
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(expectedPlaces.input, subDFG1)
            .addTransitionToPlaceArc(subDFG2, expectedPlaces.output)
            .addTransitionToPlaceArc(
                subDFG1,
                expectedPlaces.addPlace().getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                subDFG2,
            );
        expectedTransitions.removeDFG(originDFG);

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
                .addDFG(originDFG)
                .createTransition('')
                .addDFG(subDFG1)
                .createTransition('')
                .addDFG(subDFG2);
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.input,
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.output,
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(expectedPlaces.getPlaceByID('p1'), subDFG1)
            .addTransitionToPlaceArc(
                subDFG1,
                expectedPlaces.addPlace().getPlaceByID('p2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.getTransitionByID('t2'),
            );
        expectedArcs
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p3'),
            )
            .addPlaceToTransitionArc(expectedPlaces.getPlaceByID('p3'), subDFG2)
            .addTransitionToPlaceArc(
                subDFG2,
                expectedPlaces.addPlace().getPlaceByID('p4'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p4'),
                expectedTransitions.getTransitionByID('t2'),
            );
        expectedTransitions.removeDFG(originDFG);

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
                .addDFG(originDFG)
                .createTransition('')
                .addDFG(subDFG1)
                .createTransition('')
                .addDFG(subDFG2);
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.input,
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.output,
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(expectedPlaces.getPlaceByID('p1'), subDFG1)
            .addTransitionToPlaceArc(
                subDFG1,
                expectedPlaces.addPlace().getPlaceByID('p2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.getTransitionByID('t3'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t3'),
                expectedPlaces.getPlaceByID('p1'),
            );
        expectedTransitions.removeDFG(originDFG);

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
                .addDFG(originDFG)
                .createTransition('')
                .createTransition('')
                .addDFG(flowerDFG1)
                .addDFG(flowerDFG2)
                .addDFG(flowerDFG3)
                .addDFG(flowerDFG4);
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.input,
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.output,
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.getTransitionByID('t3'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t3'),
                expectedPlaces.getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.getTransitionByID('t4'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t4'),
                expectedPlaces.getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.getTransitionByID('t5'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t5'),
                expectedPlaces.getPlaceByID('p1'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p1'),
                expectedTransitions.getTransitionByID('t6'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t6'),
                expectedPlaces.getPlaceByID('p1'),
            );
        expectedTransitions.removeDFG(originDFG);

        expect(sut.places).toEqual(expectedPlaces);
        expect(sut.transitions).toEqual(expectedTransitions);
        expect(sut.arcs).toEqual(expectedArcs);
    });
});

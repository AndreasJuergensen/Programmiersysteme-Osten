import { Dfg, DfgBuilder } from '../dfg/dfg';
import { PetriNet } from './petri-net';
import { PetriNetArcs } from './petri-net-arcs';
import { PetriNetTransitions } from './petri-net-transitions';
import { Places } from './places';

describe('Petrinet update', () => {
    it('by Exclusive Cut', () => {
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
            .addArc('A', 'B')
            .addToStopArc('B')
            .build();
        const subDFG2: Dfg = new DfgBuilder()
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('Z')
            .addArc('Z', 'Y')
            .addToStopArc('Y')
            .build();

        const sut: PetriNet = new PetriNet(originDFG);
        const result: PetriNet = sut.updateByExclusiveCut(
            originDFG,
            subDFG1,
            subDFG2,
        );

        const expectedPlaces: Places = new Places();
        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.addPlace().getLastPlace(),
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getLastPlace(),
                expectedTransitions.addDFG(subDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getLastPlace(),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.addDFG(subDFG2).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.getPlaceByID('p3'),
            );

        expect(result.getAllArcs()).toEqual(expectedArcs);
        expect(result.getAllTransitions()).toEqual(expectedTransitions);
        expect(result.getAllPlaces()).toEqual(expectedPlaces);
    });

    it('by Exclusive Cut with one sub as base case', () => {
        const originDFG: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('Z')
            .addFromPlayArc('A')
            .addFromPlayArc('Z')
            .addToStopArc('B')
            .addToStopArc('Z')
            .addArc('A', 'B')
            .build();

        const sut: PetriNet = new PetriNet(originDFG);

        const subDFG1: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addToStopArc('B')
            .build();
        const subDFG2: Dfg = new DfgBuilder()
            .createActivity('Z')
            .addFromPlayArc('Z')
            .addToStopArc('Z')
            .build();

        const result: PetriNet = sut.updateByExclusiveCut(
            originDFG,
            subDFG1,
            subDFG2,
        );

        const expectedPlaces: Places = new Places();
        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.addPlace().getLastPlace(),
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getLastPlace(),
                expectedTransitions.addDFG(subDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getLastPlace(),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.addDFG(subDFG2).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.getPlaceByID('p3'),
            );

        expect(result.getAllArcs()).toEqual(expectedArcs);
        expect(result.getAllTransitions()).toEqual(expectedTransitions);
        expect(result.getAllPlaces()).toEqual(expectedPlaces);
    });

        it('by Exclusive Cut with both subs as base case', () => {
            const originDFG: Dfg = new DfgBuilder()
                .createActivity('A')
                .createActivity('Z')
                .addFromPlayArc('A')
                .addFromPlayArc('Z')
                .addToStopArc('A')
                .addToStopArc('Z')
                .build();

            const sut: PetriNet = new PetriNet(originDFG);

            const subDFG1: Dfg = new DfgBuilder()
                .createActivity('A')
                .createActivity('B')
                .addFromPlayArc('A')
                .addArc('A', 'B')
                .addToStopArc('B')
                .build();
            const subDFG2: Dfg = new DfgBuilder()
                .createActivity('Z')
                .addFromPlayArc('Z')
                .addToStopArc('Z')
                .build();

            const result: PetriNet = sut.updateByExclusiveCut(
                originDFG,
                subDFG1,
                subDFG2,
            );

            const expectedPlaces: Places = new Places();
            const expectedTransitions: PetriNetTransitions =
                new PetriNetTransitions()
                    .createTransition('play')
                    .createTransition('stop');
            const expectedArcs: PetriNetArcs = new PetriNetArcs()
                .addPlaceToTransitionArc(
                    expectedPlaces.addPlace().getLastPlace(),
                    expectedTransitions.getTransitionByID('t1'),
                )
                .addTransitionToPlaceArc(
                    expectedTransitions.getTransitionByID('t1'),
                    expectedPlaces.addPlace().getLastPlace(),
                )
                .addPlaceToTransitionArc(
                    expectedPlaces.getLastPlace(),
                    expectedTransitions.addDFG(subDFG1).getLastTransition(),
                )
                .addTransitionToPlaceArc(
                    expectedTransitions.getLastTransition(),
                    expectedPlaces.addPlace().getLastPlace(),
                )
                .addPlaceToTransitionArc(
                    expectedPlaces.getLastPlace(),
                    expectedTransitions.getTransitionByID('t2'),
                )
                .addTransitionToPlaceArc(
                    expectedTransitions.getTransitionByID('t2'),
                    expectedPlaces.addPlace().getLastPlace(),
                )
                .addPlaceToTransitionArc(
                    expectedPlaces.getPlaceByID('p2'),
                    expectedTransitions.addDFG(subDFG2).getLastTransition(),
                )
                .addTransitionToPlaceArc(
                    expectedTransitions.getLastTransition(),
                    expectedPlaces.getPlaceByID('p3'),
                );

            expect(result.getAllArcs()).toEqual(expectedArcs);
            expect(result.getAllTransitions()).toEqual(expectedTransitions);
            expect(result.getAllPlaces()).toEqual(expectedPlaces);
        });
});

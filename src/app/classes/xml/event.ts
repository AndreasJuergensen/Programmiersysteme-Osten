export interface EventXml {
    string: EventXmlProperty[] | EventXmlProperty;
}

interface EventXmlWithMultipleProperties {
    string: EventXmlProperty[];
}

interface EventXmlWithSingleProperty {
    string: EventXmlProperty;
}

export interface EventXmlProperty {
    '@_key': string;
    '@_value': string;
}

export interface Event {
    isLifecycleComplete(): boolean;

    toString(): string;
}

export function fromXml(eventXml: EventXml): Event {
    if (Array.isArray(eventXml.string)) {
        return new EventWithMultipleProperties(eventXml as EventXmlWithMultipleProperties);
    } else {
        return new EventWithSingleProperty(eventXml as EventXmlWithSingleProperty);
    }
}

class EventWithMultipleProperties implements Event {
    constructor(private readonly eventXml: EventXmlWithMultipleProperties) {}

    isLifecycleComplete(): boolean {
        return this.eventXml.string.some(
            (property) =>
                property['@_key'] === 'lifecycle:transition' &&
                property['@_value'] === 'complete',
        );
    }

    toString(): string {
        return this.eventXml.string
            .find((property) => property['@_key'] === 'concept:name')!
            ['@_value'].replaceAll(' ', '_');
    }
}
class EventWithSingleProperty implements Event {
    constructor(private readonly eventXml: EventXmlWithSingleProperty) {}

    isLifecycleComplete(): boolean {
        return this.eventXml.string['@_key'] === 'concept:name';
    }

    toString(): string {
        return this.eventXml.string['@_value'].replaceAll(' ', '_');
    }
}

import {Injectable} from "@angular/core";
import {Observable, ReplaySubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FileReaderService {

    public readFile(file: File): Observable<string> {
        const reader = new FileReader();
        const result = new ReplaySubject<string>(1);
        reader.onerror = (e) => {
            console.error('Error while reading file content', file, e);
            result.complete();
        };
        reader.onloadend = () => {
            result.next(reader.result as string);
            result.complete();
        }
        reader.readAsText(file);
        return result.asObservable();
    }

}

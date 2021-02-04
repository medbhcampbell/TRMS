import { SyntheticEvent } from "react";
import { defaultPass, gradeType } from "./claim";

interface GradeComponentProps {
    handleFormInput: ((event: SyntheticEvent) => void);
    gradingType: gradeType;
}

function GradeComponent(props: GradeComponentProps) {
    switch (props.gradingType) {
        case (gradeType.letter):
            return (
                <>
                    <select defaultValue={defaultPass.letter} onChange={props.handleFormInput} name='grade'>
                        <option value='A'>A</option>
                        <option value='B'>B</option>
                        <option value='C'>C</option>
                        <option value='D'>D</option>
                        <option value='E'>E</option>
                        <option value='F'>F</option>
                    </select>
                    <br />
                </>
            );
        case (gradeType.GPA):
            return (
                <>
                    <input type='number' defaultValue={defaultPass.GPA} onChange={props.handleFormInput} name='grade'></input>
                    <br />
                </>
            );
        case (gradeType.passFail):
            return (
                <>
                    <select defaultValue={defaultPass.passFail} onChange={props.handleFormInput} name='grade'>
                        <option value='PASS'>PASS</option>
                        <option value='FAIL'>FAIL</option>
                    </select>
                    <br />
                </>
            );
        case (gradeType.percentage):
            return (
                <>
                    <input type='number' defaultValue={defaultPass.passFail} onChange={props.handleFormInput} name='grade'></input>
                    <br />
                </>
            );
        default:
            return (
                <>
                    <p>N/A</p>
                    <br />
                </>
            );
    }
}

export default GradeComponent
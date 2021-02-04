
function WelcomeComponent() {
    //Provides a couple of basic paragraphs so the site isn't completely blank before/after logging in
    return (
        <div className='col card'>
            <h3>Welcome to <b>the cat cafe's</b> Tuition Reimbursement Management System</h3>
            <p>To encourage further learning and training, employees can be reimbursed up to $1000 per year for courses they take. You can receive up to:</p>
            <ul>
                <li>80% for university courses</li>
                <li>60% for seminars</li>
                <li>75% for certification preparation classes</li>
                <li>100% for certifications</li>
                <li>90% for technical training</li>
                <li>30% for miscellaneous education</li>
            </ul>
        </div>
    )
}

export default WelcomeComponent;
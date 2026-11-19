"""Versioned formative exercise for restoring a hosted training service."""
ID = 'mission-report-v1'
TITLE = 'Mission Command: Restore access to a staff report'
LESSON = {
    'title': TITLE,
    'context': (
        'A staff workstation cannot open a hosted report by name. '
        'Tactical Services Infrastructure (TSI) is a documented Army example of hosted tactical services. '
        'Use the supplied observations to practice the diagnostic method.'
    ),
    'equipment': [
        'Tactical Services Infrastructure (TSI) is the documented Army hosting context. The exercise provides simulated evidence and requires no fielded TSI.',
        'An authorized training workstation, a known-good comparison workstation, the supplied name-resolution baseline, and an instructor-provided report service and sample report.',
    ],
    'setup': [
        'In the training environment, confirm the instructor’s expected report hostname and current sample report.',
        'Use the comparison workstation to verify name lookup and open the sample report before starting the fault exercise.',
        'Use the exercise evidence to diagnose the affected client. A lab owner makes any authorized correction.',
    ],
    'objective': 'Distinguish name resolution from service reachability and show that the staff user can retrieve the current report.',
    'lesson': (
        'A hostname lookup and an application transaction test different dependencies. Compare the affected '
        'workstation with a known-good peer and the supplied exercise baseline. A service check by address '
        'can provide evidence about the path, but it does not validate normal hostname-based access.'
    ),
    'scenario': [
        'The staff user’s workstation opens other training services, but the normal report hostname times out in a DNS lookup.',
        'A known-good workstation resolves the expected hostname and opens the current report. The endpoint port responds by address from the affected workstation.',
        'Use the approved lab baseline and the simulated checks. No real system changes are required.',
    ],
    'sources': [
        {'title': 'Army CECOM: Modernizing tactical infrastructure', 'url': 'https://www.army.mil/article/288657/modernizing_tactical_infrastructure'},
        {'title': 'Microsoft Learn: Troubleshoot DNS client name resolution issues', 'url': 'https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/troubleshoot-dns-client-resolution-issues'},
    ],
}
QUESTIONS = [
    (
        'evidence', 'Which read-only comparison gives you the best next evidence?',
        ['Compare the affected client’s assigned resolver and lookup result with the baseline and known-good peer.',
         'Restart the shared report service for all users.', 'Reset the exercise gateway before collecting evidence.'],
        0, 'Compare name resolution and resolver settings before changing a shared service. The working peer narrows the investigation.',
    ),
    (
        'isolate', 'The next simulated check shows the affected client uses a resolver outside its supplied lab baseline. What is the supported action?',
        ['Treat a responding endpoint port as proof the problem is resolved.',
         'Ask the authorized lab owner to restore the client’s supplied resolver setting.', 'Change the shared report service address.'],
        1, 'The observed mismatch supports a scoped correction through the lab owner. The shared service works for the comparison client.',
    ),
    (
        'verify', 'After the lab owner restores the expected setting, what proves the staff task works?',
        ['The workstation shows physical link.', 'The instructor can reach the endpoint from another workstation.',
         'The affected user opens the normal hostname and confirms the current report is readable.'],
        2, 'Repeat the original staff task from the affected workstation. Confirm both access and the expected report content.',
    ),
]


def public_lesson():
    return {
        **LESSON,
        'questions': [{'id': key, 'prompt': prompt, 'options': options}
                      for key, prompt, options, _, _ in QUESTIONS],
    }


def grade(answers):
    if set(answers) != {item[0] for item in QUESTIONS}:
        raise ValueError('Answer all course questions')
    review = []
    for key, prompt, options, correct, note in QUESTIONS:
        choice = answers[key]
        if type(choice) is not int or not 0 <= choice < len(options):
            raise ValueError('Use supplied course choices')
        review.append({'id': key, 'supported': choice == correct, 'explanation': note})
    return {'score': sum(item['supported'] for item in review), 'total': len(review), 'review': review}

const db = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mathTopics = [
    {
        order_index: 1,
        title: 'Algebra Fundamentals',
        content: 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In elementary algebra, those symbols represent quantities without fixed values, known as variables. Algebra allows us to write formulas and equations, solve problems, and understand the relationship between quantities. Key concepts include variables (like x and y), constants, expressions, and equations. For example, in the equation 2x + 5 = 11, we can solve for x by isolating it: subtract 5 from both sides to get 2x = 6, then divide by 2 to get x = 3.',
        quizzes: [
            {
                question: 'What does the letter x represent in an algebraic equation?',
                options: ['An unknown variable', 'A known value', 'An operator', 'A constant'],
                correct_answer: 'An unknown variable'
            },
            {
                question: 'Simplify the algebraic expression: 2x + 3x',
                options: ['5x', '5', '6x', '5x squared'],
                correct_answer: '5x'
            }
        ]
    },
    {
        order_index: 2,
        title: 'Linear Equations',
        content: 'A linear equation is an equation between two variables that gives a straight line when plotted on a graph. The general form is y = mx + b, where m is the slope and b is the y-intercept. The slope tells us how steep the line is — a higher slope means a steeper line. The y-intercept is where the line crosses the y-axis. To solve a linear equation like 3x + 6 = 15, subtract 6 from both sides to get 3x = 9, then divide by 3 to find x = 3. Linear equations are used in everyday life, from calculating costs to measuring distances.',
        quizzes: [
            {
                question: 'What does "m" represent in the slope-intercept form y = mx + b?',
                options: ['Slope', 'Y-intercept', 'X-intercept', 'Variable'],
                correct_answer: 'Slope'
            }
        ]
    },
    {
        order_index: 3,
        title: 'Quadratic Equations',
        content: 'A quadratic equation is a second-degree polynomial equation in a single variable. The general form is ax^2 + bx + c = 0, where a, b, and c are constants (with a != 0). The solutions to a quadratic equation are called roots, and they can be found using the quadratic formula: x = (-b +- sqrt(b^2 - 4ac)) / (2a). The term under the square root, b^2 - 4ac, is called the discriminant. If it is positive, there are two distinct real roots. If it is zero, there is one real root. If it is negative, there are two complex roots.',
        quizzes: [
            {
                question: 'What is the standard form of a quadratic equation?',
                options: ['ax^2 + bx + c = 0', 'y = mx + b', 'x^2 + y^2 = r^2', 'a^2 + b^2 = c^2'],
                correct_answer: 'ax^2 + bx + c = 0'
            }
        ]
    },
    {
        order_index: 4,
        title: 'Polynomials',
        content: 'A polynomial is an expression consisting of variables and coefficients, that involves only the operations of addition, subtraction, multiplication, and non-negative integer exponents of variables. An example of a polynomial of a single variable x is x^2 - 4x + 7. The highest exponent in a polynomial is called its degree. Polynomials can be classified by the number of terms: monomial (one term), binomial (two terms), trinomial (three terms), or polynomial (many terms). They are used to model complex curves and relationships in calculus, physics, and economics.',
        quizzes: [
            {
                question: 'What is the degree of the polynomial 4x^3 - 5x^2 + x - 7?',
                options: ['3', '4', '2', '7'],
                correct_answer: '3'
            }
        ]
    },
    {
        order_index: 5,
        title: 'Systems of Equations',
        content: 'A system of equations is a set of two or more equations with the same variables. To solve a system means to find values for the variables that satisfy all equations in the system simultaneously. Common methods for solving systems of linear equations include substitution (solving one equation for a variable and substituting it into the other), elimination (adding or subtracting equations to eliminate a variable), and graphing (finding the intersection point of the lines). If the lines are parallel, there is no solution; if they coincide, there are infinitely many solutions.',
        quizzes: [
            {
                question: 'Which method solves a system by substituting one variable expression into another?',
                options: ['Substitution', 'Elimination', 'Graphing', 'Integration'],
                correct_answer: 'Substitution'
            }
        ]
    },
    {
        order_index: 6,
        title: 'Functions and Graphs',
        content: 'A function is a relation between a set of inputs and a set of permissible outputs, where each input is related to exactly one output. The set of all valid input values is called the domain, and the set of output values is the range. Graphs represent functions visually on a Cartesian coordinate system. By using the vertical line test, we can determine if a curve represents a function: if any vertical line crosses the graph more than once, it is not a function. Common functions include linear, quadratic, exponential, and logarithmic functions.',
        quizzes: [
            {
                question: 'What is the set of all possible input values for a function called?',
                options: ['Domain', 'Range', 'Codomain', 'Intercept'],
                correct_answer: 'Domain'
            }
        ]
    },
    {
        order_index: 7,
        title: 'Introduction to Geometry',
        content: 'Geometry is a branch of mathematics concerned with the properties and relations of points, lines, surfaces, solids, and higher dimensional analogs. Fundamental concepts include points, lines, angles, triangles, polygons, and circles. The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: a^2 + b^2 = c^2. Geometry is essential for measurement, architecture, and understanding spatial patterns in the physical universe.',
        quizzes: [
            {
                question: 'According to the Pythagorean theorem, which side is represented by c in a^2 + b^2 = c^2?',
                options: ['Hypotenuse', 'Adjacent side', 'Opposite side', 'Right angle'],
                correct_answer: 'Hypotenuse'
            }
        ]
    },
    {
        order_index: 8,
        title: 'Trigonometric Ratios',
        content: 'Trigonometry is the study of relationships involving lengths and angles of triangles. The primary trigonometric ratios are sine, cosine, and tangent, defined for a right triangle as: sine = opposite/hypotenuse (SOH), cosine = adjacent/hypotenuse (CAH), and tangent = opposite/adjacent (TOA). These ratios help solve for unknown sides and angles in a triangle and are fundamental in physics, engineering, astronomy, and navigation.',
        quizzes: [
            {
                question: 'What is the trigonometric ratio for Sine (SOH)?',
                options: ['Opposite / Hypotenuse', 'Adjacent / Hypotenuse', 'Opposite / Adjacent', 'Hypotenuse / Opposite'],
                correct_answer: 'Opposite / Hypotenuse'
            }
        ]
    },
    {
        order_index: 9,
        title: 'Coordinate Geometry',
        content: 'Coordinate geometry (or analytical geometry) is the study of geometry using a coordinate system. The Cartesian coordinate system uses two perpendicular axes, the x-axis (horizontal) and y-axis (vertical), meeting at the origin (0,0). Every point is defined by an ordered pair (x, y). Key formulas in coordinate geometry include the distance formula to find the distance between two points, the midpoint formula, and the slope formula. This field bridges algebra and geometry by allowing geometric shapes to be defined by algebraic equations.',
        quizzes: [
            {
                question: 'What are the coordinates of the origin on a Cartesian plane?',
                options: ['(0, 0)', '(1, 1)', '(0, 1)', '(1, 0)'],
                correct_answer: '(0, 0)'
            }
        ]
    },
    {
        order_index: 10,
        title: 'Statistics and Probability',
        content: 'Statistics is the discipline that concerns the collection, organization, analysis, interpretation, and presentation of data. Key summary statistics include the mean (average), median (middle value), and mode (most frequent value). Probability is the measure of the likelihood that an event will occur, ranging from 0 (impossible) to 1 (certain). It is calculated as the number of favorable outcomes divided by the total number of possible outcomes. Probability and statistics are crucial for decision making, scientific research, risk analysis, and machine learning.',
        quizzes: [
            {
                question: 'What is the probability of flipping a fair coin and getting heads?',
                options: ['0.5', '1.0', '0.25', '0.0'],
                correct_answer: '0.5'
            }
        ]
    },
    {
        order_index: 11,
        title: 'Sequences and Series',
        content: 'A sequence is an ordered list of numbers, and a series is the sum of the terms of a sequence. The two main types are arithmetic and geometric. In an arithmetic sequence, the difference between consecutive terms is constant (e.g., 2, 5, 8, 11...). In a geometric sequence, each term is found by multiplying the previous term by a constant ratio (e.g., 3, 6, 12, 24...). Formulas help calculate the n-th term of a sequence or the sum of the first n terms of a series.',
        quizzes: [
            {
                question: 'In which type of sequence is the ratio of consecutive terms constant?',
                options: ['Geometric sequence', 'Arithmetic sequence', 'Fibonacci sequence', 'Harmonic sequence'],
                correct_answer: 'Geometric sequence'
            }
        ]
    },
    {
        order_index: 12,
        title: 'Matrices and Determinants',
        content: 'A matrix is a rectangular array of numbers arranged in rows and columns. Matrices are used to represent linear transformations, solve systems of linear equations, and process data. Matrix operations include addition, subtraction, scalar multiplication, and matrix multiplication. The determinant is a scalar value calculated from a square matrix that yields important information, such as whether the matrix is invertible (a matrix has an inverse if and only if its determinant is non-zero).',
        quizzes: [
            {
                question: 'A square matrix has an inverse if and only if its determinant is:',
                options: ['Non-zero', 'Zero', 'Positive', 'Negative'],
                correct_answer: 'Non-zero'
            }
        ]
    },
    {
        order_index: 13,
        title: 'Vector Mathematics',
        content: 'A vector is an object that has both magnitude (length) and direction. Vectors are represented graphically by arrows pointing from an initial point to a terminal point. In coordinates, a 2D vector is written as [x, y]. Vector operations include vector addition, scalar multiplication, the dot product (resulting in a scalar, measuring how parallel two vectors are), and the cross product (resulting in a 3D vector perpendicular to both input vectors). Vectors are fundamental in physics to represent forces, velocities, and accelerations.',
        quizzes: [
            {
                question: 'Which vector operation produces a scalar result?',
                options: ['Dot Product', 'Cross Product', 'Vector Addition', 'Vector Subtraction'],
                correct_answer: 'Dot Product'
            }
        ]
    },
    {
        order_index: 14,
        title: 'Limits and Continuity',
        content: 'The limit of a function is a fundamental concept in calculus concerning the behavior of that function near a particular input value. We write lim_{x -> c} f(x) = L to mean that as x gets arbitrarily close to c, f(x) gets arbitrarily close to L. A function is continuous at a point c if the limit as x approaches c exists, the function value at c exists, and they are equal. Limits allow mathematicians to study functions at points where they are undefined, such as 0/0 indeterminate forms.',
        quizzes: [
            {
                question: 'A function f(x) is continuous at point c if the limit as x approaches c is equal to:',
                options: ['f(c)', '0', 'Infinity', '1'],
                correct_answer: 'f(c)'
            }
        ]
    },
    {
        order_index: 15,
        title: 'Introduction to Calculus',
        content: 'Calculus is the mathematical study of continuous change. It has two major branches: differential calculus (concerning rates of change and slopes of curves) and integral calculus (concerning accumulation of quantities and areas under curves). The fundamental theorem of calculus connects the two branches, showing that differentiation and integration are inverse operations. Calculus is the mathematical foundation for physics, chemistry, biology, economics, and modern engineering.',
        quizzes: [
            {
                question: 'What are the two major branches of calculus?',
                options: ['Differential and Integral', 'Algebraic and Geometric', 'Statistical and Probabilistic', 'Linear and Vector'],
                correct_answer: 'Differential and Integral'
            }
        ]
    }
];

const scienceTopics = [
    {
        order_index: 1,
        title: 'Photosynthesis',
        content: 'Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy (usually from the sun) into chemical energy stored in glucose. The overall equation is: 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2. This process occurs primarily in the chloroplasts of plant cells, which contain a green pigment called chlorophyll. Photosynthesis has two main stages: the light-dependent reactions (which capture solar energy and produce ATP) and the Calvin cycle (which uses that energy to fix CO2 into glucose). Photosynthesis is critical for life on Earth as it produces the oxygen we breathe.',
        quizzes: [
            {
                question: 'What do plants need for photosynthesis?',
                options: ['Water, carbon dioxide and sunlight', 'Oxygen and light', 'Soil and water', 'Nitrogen and oxygen'],
                correct_answer: 'Water, carbon dioxide and sunlight'
            },
            {
                question: 'What gas is released during photosynthesis?',
                options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
                correct_answer: 'Oxygen'
            }
        ]
    },
    {
        order_index: 2,
        title: 'Cellular Respiration',
        content: 'Cellular respiration is the process by which cells break down glucose to release energy in the form of ATP (adenosine triphosphate). The overall equation is: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ATP. This process occurs in the mitochondria and has three main stages: Glycolysis (in the cytoplasm), the Krebs Cycle (in the mitochondrial matrix), and the Electron Transport Chain (on the inner mitochondrial membrane). One molecule of glucose can produce up to 36-38 ATP molecules. Cellular respiration is the reverse of photosynthesis and is how animals (and plants in the dark) get the energy they need to survive.',
        quizzes: [
            {
                question: 'In which organelle does the majority of cellular respiration occur?',
                options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Ribosome'],
                correct_answer: 'Mitochondria'
            }
        ]
    },
    {
        order_index: 3,
        title: 'Structure of the Atom',
        content: 'An atom is the basic unit of a chemical element. It consists of a central nucleus surrounded by a cloud of negatively charged electrons. The nucleus contains positively charged protons and neutral neutrons. Electrons occupy specific energy levels or shells around the nucleus. The atomic number of an element is the number of protons in its nucleus, which determines the element\'s identity. The mass number is the sum of protons and neutrons. Isotopes are atoms of the same element with different numbers of neutrons.',
        quizzes: [
            {
                question: 'Which subatomic particle carries a positive electric charge?',
                options: ['Proton', 'Neutron', 'Electron', 'Quark'],
                correct_answer: 'Proton'
            }
        ]
    },
    {
        order_index: 4,
        title: 'Chemical Bonding',
        content: 'Chemical bonding refers to the attraction between atoms that allows the formation of chemical substances containing two or more atoms. The main types of chemical bonds are ionic bonds (formed when one atom transfers electrons to another, resulting in electrostatic attraction between ions), covalent bonds (formed when atoms share electrons to achieve a stable electron configuration), and metallic bonds (formed by a shared pool of free electrons among metal atoms). Bonding allows atoms to attain a stable outer electron shell.',
        quizzes: [
            {
                question: 'What type of bond is formed when atoms share electrons?',
                options: ['Covalent bond', 'Ionic bond', 'Metallic bond', 'Hydrogen bond'],
                correct_answer: 'Covalent bond'
            }
        ]
    },
    {
        order_index: 5,
        title: 'Periodic Table Trends',
        content: 'The periodic table organizes chemical elements by increasing atomic number. Elements in the same column (group) have similar chemical properties because they have the same number of valence electrons. Elements in the same row (period) have the same number of electron shells. Important periodic trends include electronegativity (an atom\'s ability to attract electrons), ionization energy (energy required to remove an electron), and atomic radius (size of the atom). These trends repeat periodically across the table.',
        quizzes: [
            {
                question: 'Elements in the same column of the periodic table are in the same:',
                options: ['Group', 'Period', 'Block', 'Shell'],
                correct_answer: 'Group'
            }
        ]
    },
    {
        order_index: 6,
        title: 'States of Matter',
        content: 'Matter exists in several distinct physical forms, known as states or phases. The four fundamental states observable in everyday life are solid, liquid, gas, and plasma. Solids have a fixed volume and shape, with closely packed particles. Liquids have a fixed volume but take the shape of their container, with particles that can slide past one another. Gases have neither a fixed volume nor shape, expanding to fill their container. Plasma consists of highly ionized gas containing free electrons and ions. Phase transitions, such as melting, boiling, condensation, and freezing, occur with changes in temperature or pressure.',
        quizzes: [
            {
                question: 'Which state of matter has a fixed volume but no fixed shape?',
                options: ['Liquid', 'Solid', 'Gas', 'Plasma'],
                correct_answer: 'Liquid'
            }
        ]
    },
    {
        order_index: 7,
        title: 'Newton\'s Laws of Motion',
        content: 'Sir Isaac Newton formulated three laws of motion that describe the relationship between a body and the forces acting upon it. The First Law (Inertia) states that an object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force. The Second Law states that force equals mass times acceleration (F = ma). The Third Law states that for every action, there is an equal and opposite reaction. These laws form the foundation of classical mechanics.',
        quizzes: [
            {
                question: 'What is the formula representing Newton\'s Second Law of Motion?',
                options: ['F = ma', 'E = mc^2', 'v = d / t', 'p = mv'],
                correct_answer: 'F = ma'
            }
        ]
    },
    {
        order_index: 8,
        title: 'Work, Energy and Power',
        content: 'In physics, work is done when a force acting on an object moves it through a distance (Work = Force * Distance). Energy is the capacity to do work, existing in forms like kinetic energy (energy of motion, KE = 0.5 * m * v^2) and potential energy (stored energy, PE = m * g * h). The law of conservation of energy states that energy cannot be created or destroyed, only transformed. Power is the rate at which work is done or energy is transferred (Power = Work / Time), measured in Watts.',
        quizzes: [
            {
                question: 'What is the SI unit of power?',
                options: ['Watt', 'Joule', 'Newton', 'Volt'],
                correct_answer: 'Watt'
            }
        ]
    },
    {
        order_index: 9,
        title: 'Waves and Sound',
        content: 'A wave is a disturbance that travels through space and matter, transferring energy from one point to another without transferring matter. Waves are classified as transverse (particles vibrate perpendicular to wave direction) or longitudinal (particles vibrate parallel to wave direction). Sound is a mechanical, longitudinal wave that propagates through a medium (like air, water, or solids) via compression and rarefaction. Key wave properties include frequency (pitch), amplitude (volume), wavelength, and wave speed.',
        quizzes: [
            {
                question: 'Sound waves are what type of waves?',
                options: ['Longitudinal mechanical waves', 'Transverse electromagnetic waves', 'Shear waves', 'Radio waves'],
                correct_answer: 'Longitudinal mechanical waves'
            }
        ]
    },
    {
        order_index: 10,
        title: 'Electromagnetic Spectrum',
        content: 'The electromagnetic spectrum is the range of all types of electromagnetic radiation. Unlike sound waves, electromagnetic waves are transverse, do not require a physical medium, and travel at the speed of light in a vacuum. The spectrum ranges from long-wavelength, low-frequency radio waves, to microwaves, infrared, visible light (the only part humans can see), ultraviolet, X-rays, and extremely short-wavelength, high-energy gamma rays. They are used in communication, medical imaging, and cooking.',
        quizzes: [
            {
                question: 'Which electromagnetic waves have the shortest wavelength and highest energy?',
                options: ['Gamma Rays', 'Radio Waves', 'Visible Light', 'Infrared Waves'],
                correct_answer: 'Gamma Rays'
            }
        ]
    },
    {
        order_index: 11,
        title: 'Genetics and DNA',
        content: 'Genetics is the study of genes, genetic variation, and heredity in organisms. DNA (deoxyribonucleic acid) is the molecule that carries genetic instructions. It has a double-helix structure consisting of nucleotides made of a sugar, a phosphate group, and a nitrogenous base: Adenine (A), Thymine (T), Cytosine (C), and Guanine (G). A pairs with T, and C pairs with G. Genes are segments of DNA that code for proteins, which determine traits. Gregor Mendel established the laws of inheritance through his experiments with pea plants.',
        quizzes: [
            {
                question: 'In a DNA double helix, Adenine (A) always pairs with:',
                options: ['Thymine (T)', 'Guanine (G)', 'Cytosine (C)', 'Uracil (U)'],
                correct_answer: 'Thymine (T)'
            }
        ]
    },
    {
        order_index: 12,
        title: 'Ecosystems and Food Webs',
        content: 'An ecosystem is a community of living organisms (biotic factors) interacting with their non-living environment (abiotic factors). Energy enters ecosystems via primary producers (plants performing photosynthesis). Herbivores eat producers, and carnivores eat herbivores, forming food chains. Food webs represent the complex, interlocking feeding relationships within an ecosystem. Decomposers (bacteria and fungi) break down dead organic matter, recycling nutrients. Energy is lost as heat at each trophic level (only about 10% transfers up).',
        quizzes: [
            {
                question: 'Which organisms recycle nutrients by breaking down dead organic matter?',
                options: ['Decomposers', 'Producers', 'Herbivores', 'Apex Predators'],
                correct_answer: 'Decomposers'
            }
        ]
    },
    {
        order_index: 13,
        title: 'Human Body Systems',
        content: 'The human body consists of several organ systems working together to maintain homeostasis. Key systems include the circulatory system (transports oxygen, nutrients, and waste via the heart and blood vessels), respiratory system (exchanges oxygen and carbon dioxide), digestive system (breaks down food), nervous system (controls body actions via the brain and nerves), skeletal system (provides structure), and muscular system (enables movement). All systems coordinate to keep the organism alive.',
        quizzes: [
            {
                question: 'Which system is responsible for transporting oxygen and nutrients throughout the body?',
                options: ['Circulatory system', 'Respiratory system', 'Nervous system', 'Digestive system'],
                correct_answer: 'Circulatory system'
            }
        ]
    },
    {
        order_index: 14,
        title: 'Plate Tectonics',
        content: 'Plate tectonics is the scientific theory explaining the movement of Earth\'s lithosphere, which is divided into large tectonic plates. These plates float on the semi-fluid asthenosphere below. Tectonic plate boundaries are active geological zones where plates diverge (move apart, forming mid-ocean ridges), converge (collide, forming mountains or subduction zones), or transform (slide past each other, causing earthquakes). This movement is driven by convection currents in the mantle and shapes the Earth\'s crust.',
        quizzes: [
            {
                question: 'What type of boundary occurs where tectonic plates slide horizontally past one another?',
                options: ['Transform boundary', 'Divergent boundary', 'Convergent boundary', 'Subduction boundary'],
                correct_answer: 'Transform boundary'
            }
        ]
    },
    {
        order_index: 15,
        title: 'Space and the Solar System',
        content: 'The Solar System consists of the Sun and the celestial objects bound to it by gravity, including eight planets: Mercury, Venus, Earth, Mars (terrestrial planets), and Jupiter, Saturn, Uranus, Neptune (gas/ice giants). It also contains dwarf planets (like Pluto), moons, asteroids, and comets. The Sun, a medium-sized star, makes up over 99.8% of the Solar System\'s mass. The Solar System is situated in the Milky Way galaxy, which is one of billions of galaxies in the observable universe.',
        quizzes: [
            {
                question: 'Which planet is the largest in our Solar System?',
                options: ['Jupiter', 'Saturn', 'Earth', 'Neptune'],
                correct_answer: 'Jupiter'
            }
        ]
    }
];

async function setupDatabase() {
    const isProd = typeof db.isProduction === 'function' ? db.isProduction() : false;
    console.log(`Setting up ${isProd ? 'PostgreSQL' : 'SQLite'} Database...`);

    const pkType = isProd ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    const cascade = isProd ? 'CASCADE' : '';

    try {
        // Drop all tables in correct dependency order
        await db.query(`DROP TABLE IF EXISTS ProgressTracking ${cascade}`);
        await db.query(`DROP TABLE IF EXISTS QuizAttempts ${cascade}`);
        await db.query(`DROP TABLE IF EXISTS Quizzes ${cascade}`);
        await db.query(`DROP TABLE IF EXISTS Topics ${cascade}`);
        await db.query(`DROP TABLE IF EXISTS Subjects ${cascade}`);
        await db.query(`DROP TABLE IF EXISTS Users ${cascade}`);

        console.log('Old tables dropped. Recreating...');

        // Users Table
        await db.query(`
            CREATE TABLE Users (
                id ${pkType},
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student'
            )
        `);

        // Subjects Table
        await db.query(`
            CREATE TABLE Subjects (
                id ${pkType},
                name TEXT NOT NULL
            )
        `);

        // Topics Table
        await db.query(`
            CREATE TABLE Topics (
                id ${pkType},
                subject_id INTEGER NOT NULL REFERENCES Subjects(id),
                order_index INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT
            )
        `);

        // Quizzes Table
        await db.query(`
            CREATE TABLE Quizzes (
                id ${pkType},
                topic_id INTEGER NOT NULL REFERENCES Topics(id),
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                correct_answer TEXT NOT NULL
            )
        `);

        // QuizAttempts
        await db.query(`
            CREATE TABLE QuizAttempts (
                id ${pkType},
                user_id INTEGER NOT NULL,
                topic_id INTEGER NOT NULL,
                score REAL NOT NULL,
                passed BOOLEAN NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ProgressTracking
        await db.query(`
            CREATE TABLE ProgressTracking (
                user_id INTEGER NOT NULL,
                topic_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                PRIMARY KEY (user_id, topic_id)
            )
        `);

        console.log('Tables created. Seeding data...');

        // Hash passwords
        const studentHash = await bcrypt.hash('student123', 10);
        const teacherHash = await bcrypt.hash('teacher123', 10);

        // Seed Users
        await db.query(
            `INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
            ['Demo Student', 'student@alms.com', studentHash, 'student',
             'Demo Teacher', 'teacher@alms.com', teacherHash, 'teacher']
        );

        // Seed Subjects
        const subjectRes = await db.query(
            `INSERT INTO Subjects (name) VALUES ($1), ($2), ($3), ($4), ($5), ($6) RETURNING id`,
            ['Mathematics', 'Basic Science', 'English Language', 'Social Studies', 'Computer Studies', 'Agricultural Science']
        );
        // SQLite RETURNING clause compatibility fallback
        let mathId, sciId, engId, socId, compId, agricId;
        if (subjectRes.rows && subjectRes.rows.length > 0) {
            mathId = subjectRes.rows[0].id;
            sciId  = subjectRes.rows[1].id;
            engId  = subjectRes.rows[2].id;
            socId  = subjectRes.rows[3].id;
            compId = subjectRes.rows[4].id;
            agricId = subjectRes.rows[5].id;
        } else {
            const mathRow = await db.query("SELECT id FROM Subjects WHERE name = 'Mathematics'");
            const sciRow = await db.query("SELECT id FROM Subjects WHERE name = 'Basic Science'");
            const engRow = await db.query("SELECT id FROM Subjects WHERE name = 'English Language'");
            const socRow = await db.query("SELECT id FROM Subjects WHERE name = 'Social Studies'");
            const compRow = await db.query("SELECT id FROM Subjects WHERE name = 'Computer Studies'");
            const agricRow = await db.query("SELECT id FROM Subjects WHERE name = 'Agricultural Science'");
            mathId = mathRow.rows[0].id;
            sciId = sciRow.rows[0].id;
            engId = engRow.rows[0].id;
            socId = socRow.rows[0].id;
            compId = compRow.rows[0].id;
            agricId = agricRow.rows[0].id;
        }

        console.log(`Subjects seeded: Math=${mathId}, Sci=${sciId}, Eng=${engId}, Soc=${socId}, Comp=${compId}, Agric=${agricId}`);

        const mathIds = [];
        const scienceIds = [];

        // Seed Mathematics Topics
        console.log('Seeding Mathematics topics...');
        for (const topic of mathTopics) {
            const topicRes = await db.query(
                `INSERT INTO Topics (subject_id, order_index, title, content) VALUES ($1, $2, $3, $4) RETURNING id`,
                [mathId, topic.order_index, topic.title, topic.content]
            );
            let topicId;
            if (topicRes.rows && topicRes.rows.length > 0) {
                topicId = topicRes.rows[0].id;
            } else if (topicRes.lastID !== undefined) {
                topicId = topicRes.lastID;
            } else {
                const row = await db.query(`SELECT id FROM Topics WHERE title = $1`, [topic.title]);
                topicId = row.rows[0].id;
            }
            mathIds.push(topicId);

            // Seed Quizzes for this Topic
            for (const quiz of topic.quizzes) {
                await db.query(
                    `INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)`,
                    [topicId, quiz.question, JSON.stringify(quiz.options), quiz.correct_answer]
                );
            }
        }

        // Seed Basic Science Topics
        console.log('Seeding Basic Science topics...');
        for (const topic of scienceTopics) {
            const topicRes = await db.query(
                `INSERT INTO Topics (subject_id, order_index, title, content) VALUES ($1, $2, $3, $4) RETURNING id`,
                [sciId, topic.order_index, topic.title, topic.content]
            );
            let topicId;
            if (topicRes.rows && topicRes.rows.length > 0) {
                topicId = topicRes.rows[0].id;
            } else if (topicRes.lastID !== undefined) {
                topicId = topicRes.lastID;
            } else {
                const row = await db.query(`SELECT id FROM Topics WHERE title = $1`, [topic.title]);
                topicId = row.rows[0].id;
            }
            scienceIds.push(topicId);

            // Seed Quizzes for this Topic
            for (const quiz of topic.quizzes) {
                await db.query(
                    `INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)`,
                    [topicId, quiz.question, JSON.stringify(quiz.options), quiz.correct_answer]
                );
            }
        }

        // Seed English Language Topic
        console.log('Seeding English Language topic...');
        const engTopicRes = await db.query(
            `INSERT INTO Topics (subject_id, order_index, title, content) VALUES ($1, 1, $2, $3) RETURNING id`,
            [engId, 'Parts of Speech', 'Words are divided into different kinds or classes, called Parts of Speech, according to their use; that is, according to the work they do in a sentence. The parts of speech are eight in number: Noun, Pronoun, Adjective, Verb, Adverb, Preposition, Conjunction, and Interjection. A noun is a word used as the name of a person, place, or thing. A pronoun is a word used instead of a noun. An adjective is a word used to add something to the meaning of a noun. A verb is a word used to express an action or state. An adverb is a word used to add something to the meaning of a verb, an adjective, or another adverb.']
        );
        let engTopicId = engTopicRes.rows && engTopicRes.rows.length > 0 ? engTopicRes.rows[0].id : engTopicRes.lastID;
        if (!engTopicId) {
            const row = await db.query(`SELECT id FROM Topics WHERE title = 'Parts of Speech'`);
            engTopicId = row.rows[0].id;
        }
        await db.query(
            `INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)`,
            [engTopicId, 'Which part of speech is a word used as the name of a person, place, or thing?', '["Noun","Pronoun","Verb","Adverb"]', 'Noun']
        );

        // Seed Social Studies Topic
        console.log('Seeding Social Studies topic...');
        const socTopicRes = await db.query(
            `INSERT INTO Topics (subject_id, order_index, title, content) VALUES ($1, 1, $2, $3) RETURNING id`,
            [socId, 'Family and Society', 'The family is the basic social unit of society. It typically consists of parents and their children. Families can be nuclear (parents and children) or extended (including grandparents, aunts, uncles, and cousins). The family plays a crucial role in socialization, providing emotional support, and transmitting cultural values to the next generation. Society is a group of people living together in a ordered community, sharing laws, traditions, and values. The stability of a society depends heavily on the strength of its families.']
        );
        let socTopicId = socTopicRes.rows && socTopicRes.rows.length > 0 ? socTopicRes.rows[0].id : socTopicRes.lastID;
        if (!socTopicId) {
            const row = await db.query(`SELECT id FROM Topics WHERE title = 'Family and Society'`);
            socTopicId = row.rows[0].id;
        }
        await db.query(
            `INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)`,
            [socTopicId, 'What is the basic social unit of society?', '["Family","School","Government","Market"]', 'Family']
        );

        // Seed Computer Studies Topic
        console.log('Seeding Computer Studies topic...');
        const compTopicRes = await db.query(
            `INSERT INTO Topics (subject_id, order_index, title, content) VALUES ($1, 1, $2, $3) RETURNING id`,
            [compId, 'Introduction to Computers', 'A computer is an electronic device that manipulates information, or data. It has the ability to store, retrieve, and process data. You may already know that you can use a computer to type documents, send email, play games, and browse the Web. You can also use it to edit or create spreadsheets, presentations, and even videos. Computers consist of hardware (the physical parts of the computer like the CPU, keyboard, and monitor) and software (the set of instructions that tells the hardware what to do, like the operating system and applications).']
        );
        let compTopicId = compTopicRes.rows && compTopicRes.rows.length > 0 ? compTopicRes.rows[0].id : compTopicRes.lastID;
        if (!compTopicId) {
            const row = await db.query(`SELECT id FROM Topics WHERE title = 'Introduction to Computers'`);
            compTopicId = row.rows[0].id;
        }
        await db.query(
            `INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)`,
            [compTopicId, 'What are the physical parts of a computer called?', '["Hardware","Software","Data","Network"]', 'Hardware']
        );

        // Seed Agricultural Science Topic
        console.log('Seeding Agricultural Science topic...');
        const agricTopicRes = await db.query(
            `INSERT INTO Topics (subject_id, order_index, title, content) VALUES ($1, 1, $2, $3) RETURNING id`,
            [agricId, 'Types of Crops', 'In agriculture, crops are plants that are grown and harvested for profit or subsistence. Crops are classified into different categories based on their uses, life cycles, and growth habits. Common classifications include food crops (grown for human consumption, like rice, maize, and wheat), cash crops (grown for sale or industrial use, like cocoa, cotton, and rubber), forage crops (grown for feeding livestock, like alfalfa and grass), and fiber crops (grown for industrial fibers, like hemp and jute). Proper crop management is essential for ensuring food security.']
        );
        let agricTopicId = agricTopicRes.rows && agricTopicRes.rows.length > 0 ? agricTopicRes.rows[0].id : agricTopicRes.lastID;
        if (!agricTopicId) {
            const row = await db.query(`SELECT id FROM Topics WHERE title = 'Types of Crops'`);
            agricTopicId = row.rows[0].id;
        }
        await db.query(
            `INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)`,
            [agricTopicId, 'Crops grown for sale or industrial use are known as:', '["Cash crops","Food crops","Forage crops","Fiber crops"]', 'Cash crops']
        );

        console.log(`Topics seeded successfully: Math=${mathIds.length}, Science=${scienceIds.length}`);

        // Seed Progress for student (user id = 1): unlock 9 Math topics and 11 Science topics (20 total active topics)
        console.log('Seeding student progress tracking to unlock active topics...');
        const topicsToUnlock = [...mathIds.slice(0, 9), ...scienceIds.slice(0, 11)];
        for (const tId of topicsToUnlock) {
            await db.query(
                `INSERT INTO ProgressTracking (user_id, topic_id, status) VALUES ($1, $2, $3)`,
                [1, tId, 'unlocked']
            );
        }

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    }
}

module.exports = setupDatabase;

if (require.main === module) {
    setupDatabase().then(() => process.exit(0)).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

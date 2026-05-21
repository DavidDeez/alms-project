import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// High-fidelity NERDC Curriculum Dataset
const CURRICULUM_DATA = {
    Mathematics: {
        'JSS 1': {
            'Term 1': [
                { week: 'Week 1-2', topic: 'Whole Numbers & Large Numbers', objectives: ['Write whole numbers in words and figures', 'Determine the place value of any digit in a number', 'Convert numbers to Roman numerals and vice-versa'] },
                { week: 'Week 3', topic: 'Prime Factors, HCF & LCM', objectives: ['Identify prime numbers and write numbers as product of prime factors', 'Find the Highest Common Factor (HCF) of numbers', 'Find the Lowest Common Multiple (LCM) of numbers'] },
                { week: 'Week 4-5', topic: 'Fractions Operations', objectives: ['Distinguish between proper, improper, and mixed fractions', 'Convert fractions to decimals and percentages', 'Perform addition, subtraction, multiplication, and division on fractions'] },
                { week: 'Week 6', topic: 'Estimation and Approximation', objectives: ['Estimate results of sums, products, and differences', 'Round off numbers to nearest tens, hundreds, and thousands', 'Round numbers to decimal places and significant figures'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Number Bases (Binary)', objectives: ['Convert numbers from base 10 to base 2 (binary)', 'Convert binary numbers back to base 10', 'Perform simple addition and subtraction of binary numbers'] },
                { week: 'Week 2-3', topic: 'Algebra Fundamentals', objectives: ['Translate word problems into algebraic symbols', 'Identify variables, constants, and coefficients in expressions', 'Simplify simple algebraic expressions by grouping like terms'], dbTopicMatch: 'algebra fundamentals' },
                { week: 'Week 4-5', topic: 'Directed Numbers & Number Line', objectives: ['Represent positive and negative integers on a number line', 'Perform addition and subtraction of directed numbers', 'Apply directed numbers in daily calculations (profit/loss, temperature)'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Plane Shapes Properties', objectives: ['Identify properties of triangles, rectangles, squares, and circles', 'Distinguish between regular and irregular polygons', 'Calculate perimeters of basic plane shapes'] },
                { week: 'Week 2', topic: 'Angles and Measurement', objectives: ['Identify types of angles (acute, obtuse, right, reflex)', 'Measure angles using a protractor', 'Solve simple problems involving angles at a point or on a straight line'] },
                { week: 'Week 3', topic: 'Geometric Construction', objectives: ['Construct perpendicular and parallel lines', 'Construct angles of 60, 90, 45, and 30 degrees using ruler and compass', 'Construct simple triangles given three sides'] },
                { week: 'Week 4', topic: 'Measures of Average', objectives: ['Calculate the arithmetic Mean of a set of data', 'Find the Median (middle value) of a data set', 'Identify the Mode (most frequent value) in data'] },
            ]
        },
        'JSS 2': {
            'Term 1': [
                { week: 'Week 1', topic: 'Directed Numbers Operations', objectives: ['Multiply and divide directed numbers successfully', 'Use directed numbers in simple brackets expansion', 'Solve word problems involving positive and negative numbers'] },
                { week: 'Week 2', topic: 'Ratios, Percentages & Proportions', objectives: ['Simplify ratios and divide quantities in given ratios', 'Increase or decrease quantities by percentages', 'Solve direct and inverse proportion problems'] },
                { week: 'Week 3', topic: 'Simple Interest & Finances', objectives: ['Calculate Simple Interest using the formula I = PRT/100', 'Determine Principal, Rate, or Time in a finance problem', 'Understand concepts of profit, loss, discount, and commission'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Linear Equations', objectives: ['Solve simple linear equations in one variable', 'Translate everyday word problems into linear equations', 'Verify the solutions of equations by substitution'], dbTopicMatch: 'linear equations' },
                { week: 'Week 2', topic: 'Linear Inequalities', objectives: ['Solve linear inequalities in one variable', 'Represent inequality solutions on a number line', 'Apply inequalities to real-world boundary problems'] },
                { week: 'Week 3', topic: 'Pythagoras Theorem', objectives: ['State the Pythagoras Theorem (a^2 + b^2 = c^2)', 'Calculate the hypotenuse or other sides of a right-angled triangle', 'Apply Pythagoras theorem to solve height and distance problems'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Volumes of Prisms & Cylinders', objectives: ['Calculate the surface area of cubes, cuboids, and cylinders', 'Calculate the volume of prisms and cylinders', 'Solve word problems involving capacities of tanks'] },
                { week: 'Week 2', topic: 'Probability Basics', objectives: ['Define probability and understand the scale from 0 to 1', 'Calculate the probability of simple experimental events', 'Solve games of chance involving coins, cards, and dice'] },
            ]
        },
        'JSS 3': {
            'Term 1': [
                { week: 'Week 1', topic: 'Binary Operations & Bases', objectives: ['Perform addition, subtraction, multiplication, and division in other bases (bases 2, 5, 8)', 'Convert numbers between various bases', 'Solve base equations'] },
                { week: 'Week 2', topic: 'Rational & Irrational Numbers', objectives: ['Distinguish between rational and irrational numbers', 'Simplify numbers written in indices', 'Apply basic laws of indices to solve expressions'] },
                { week: 'Week 3', topic: 'Expansion of Algebraic Expressions', objectives: ['Expand expressions of the form (a+b)(c+d)', 'Apply binomial expansion to expand squares like (a+b)^2', 'Simplify expanded expressions by grouping like terms'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Simultaneous Linear Equations', objectives: ['Solve simultaneous equations using elimination method', 'Solve simultaneous equations using substitution method', 'Plot graphs to find graphical solutions to simultaneous equations'] },
                { week: 'Week 2', topic: 'Quadratic Equations', objectives: ['Solve quadratic equations of the form ax^2 + bx + c = 0 by factorization', 'Find roots of quadratic equations with simple coefficients', 'Apply quadratic equations to solve quantitative problems'] },
                { week: 'Week 3', topic: 'Variations', objectives: ['Formulate equations for Direct and Inverse variations', 'Formulate equations for Joint and Partial variations', 'Solve complex word problems involving combined variations'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Mensuration of Solid Shapes', objectives: ['Calculate the surface area and volume of a sphere', 'Calculate the surface area and volume of a cone', 'Solve compound mensuration problems (cylinder topped by cone)'] },
                { week: 'Week 2', topic: 'Trigonometric Ratios', objectives: ['Define Sine, Cosine, and Tangent using right-angled triangles (SOHCAHTOA)', 'Find angles and sides using trigonometric tables or calculators', 'Solve simple problems on angles of elevation and depression'] },
            ]
        },
        'SS 1': {
            'Term 1': [
                { week: 'Week 1', topic: 'Number Bases Expansion', objectives: ['Convert fractional numbers to base 10 from other bases', 'Solve complex algebraic equations involving number bases', 'Understand computer data representation using hexadecimal and octal'] },
                { week: 'Week 2', topic: 'Modular Arithmetic', objectives: ['Describe and perform addition, subtraction, and multiplication in modular arithmetic', 'Apply modular arithmetic to calendar and clock systems', 'Find modular inverses and solve simple linear modular equations'] },
                { week: 'Week 3', topic: 'Indices Laws', objectives: ['Apply laws of indices including fractional and negative indices', 'Solve exponential equations using index laws', 'Simplify complex surds and index expressions'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Set Theory & Venn Diagrams', objectives: ['Define sets, elements, universal set, empty set, subsets, and complement', 'Perform union, intersection, and difference of sets', 'Solve three-set problem scenarios using Venn diagrams'] },
                { week: 'Week 2', topic: 'Quadratic Equations (Formula Method)', objectives: ['Solve quadratic equations by completing the square', 'Derive and apply the general quadratic formula (Al-Khwarizmi formula)', 'Determine the nature of roots using the discriminant (b^2 - 4ac)'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Trigonometry & Sine/Cosine Rules', objectives: ['Extend trigonometric ratios to obtuse and reflex angles', 'State and apply the Sine Rule (a/sin A = b/sin B)', 'State and apply the Cosine Rule (a^2 = b^2 + c^2 - 2bc cos A)'] },
                { week: 'Week 2', topic: 'Coordinate Geometry of Straight Line', objectives: ['Calculate the distance between two points and midpoint of a line segment', 'Find the gradient/slope of a straight line', 'Write equations of straight lines in gradient/intercept form'] },
            ]
        },
        'SS 2': {
            'Term 1': [
                { week: 'Week 1', topic: 'Logarithms of Numbers < 1', objectives: ['Calculate characteristics and mantissa for numbers less than 1', 'Perform multiplication, division, powers, and roots using log tables', 'Solve logarithmic equations'] },
                { week: 'Week 2', topic: 'Sequence & Series: AP', objectives: ['Define sequence and series', 'Find the nth term of an Arithmetic Progression (AP)', 'Calculate the sum of the first n terms of an AP'] },
                { week: 'Week 3', topic: 'Sequence & Series: GP', objectives: ['Find the nth term of a Geometric Progression (GP)', 'Calculate the sum of the first n terms of a GP', 'Find the sum to infinity of a GP'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Linear Inequalities in 2 Variables', objectives: ['Graph linear inequalities on a Cartesian plane', 'Identify the feasible region bounded by a system of inequalities', 'Formulate linear programming models based on resource limits'] },
                { week: 'Week 2', topic: 'Algebraic Fractions', objectives: ['Simplify algebraic fractions by factorization', 'Perform operations (+, -, *, /) on algebraic fractions', 'Solve equations involving algebraic fractions'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Circle Geometry Theorems', objectives: ['Prove circle theorems relating to chords, tangents, and angles in a segment', 'Apply circle theorems to calculate unknown angles', 'Prove that the angle subtended by an arc at the center is twice that at the circumference'] },
                { week: 'Week 2', topic: 'Bearings and Distances', objectives: ['Represent directions using 3-figure bearings (000° to 360°) and compass bearings', 'Calculate distances and bearings between two points using sine/cosine rules', 'Solve navigation and surveying problems'] },
            ]
        },
        'SS 3': {
            'Term 1': [
                { week: 'Week 1-2', topic: 'Matrices & Determinants', objectives: ['Perform addition, subtraction, and multiplication of matrices', 'Calculate the determinant and transpose of 2x2 and 3x3 matrices', 'Find the inverse of a 2x2 matrix and solve simultaneous equations'] },
                { week: 'Week 3-4', topic: 'Vectors in a Plane', objectives: ['Represent vectors in component form (xi + yj)', 'Add, subtract, and multiply vectors by scalars', 'Calculate scalar product (dot product) and angles between vectors'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Coordinate Geometry of Circle', objectives: ['Find the equation of a circle given center and radius', 'Convert standard circle equations to general forms', 'Find the center and radius of a circle from its general equation'] },
                { week: 'Week 2', topic: 'Introductory Calculus (Differentiation)', objectives: ['Understand limits and rate of change', 'Differentiate simple algebraic functions from first principles', 'Apply rules of differentiation (product rule, quotient rule, chain rule)'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Introductory Calculus (Integration)', objectives: ['Define integration as the reverse of differentiation', 'Integrate simple polynomial functions', 'Calculate the area under a curve using definite integrals'] },
            ]
        }
    },
    'Basic Science': {
        'JSS 1': {
            'Term 1': [
                { week: 'Week 1', topic: 'Introduction to Basic Science', objectives: ['Define Basic Science and explain its importance', 'State the steps in the scientific method', 'Identify safety rules in a science laboratory'] },
                { week: 'Week 2', topic: 'Living and Non-Living Things', objectives: ['State the characteristics of living things (MR NIGER D)', 'Classify living things into plants and animals', 'Identify differences between living and non-living things'] },
                { week: 'Week 3', topic: 'Family Health & Sanitation', objectives: ['Explain personal hygiene and identify materials used for cleanliness', 'State methods of refuse and sewage disposal in the community', 'Describe the relationship between poor sanitation and disease spread'] },
                { week: 'Week 4', topic: 'Human Development: Puberty', objectives: ['Define puberty and state age ranges for boys and girls', 'List physical changes that occur during puberty in males and females', 'Describe hygiene practices during menstruation'] },
                { week: 'Week 5', topic: 'Disease Prevention & Immunization', objectives: ['Define immunization and list major vaccines', 'Identify transmission methods of STIs and HIV/AIDS', 'State prevention methods against disease vectors (mosquitoes, houseflies)'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Matter: States and Properties', objectives: ['Define matter and identify the three states of matter', 'Explain the physical properties of solids, liquids, and gases', 'Distinguish between metals and non-metals based on properties'] },
                { week: 'Week 2', topic: 'Energy: Forms and Sources', objectives: ['Define energy and work', 'Identify forms of energy (chemical, electrical, light, heat, sound)', 'Explain the law of conservation of energy and energy transformation'] },
                { week: 'Week 3', topic: 'Environmental Pollution', objectives: ['Define environmental pollution and list its types (Air, Water, Land)', 'State the causes and effects of air and water pollution', 'List methods of controlling environmental pollution'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Force & Friction', objectives: ['Define force and identify its types (contact and non-contact forces)', 'Explain the concept of friction, its advantages, and disadvantages', 'State methods of reducing friction'] },
                { week: 'Week 2', topic: 'The Earth in Space', objectives: ['Describe the solar system and name the nine planets in order', 'Explain the rotation and revolution of the earth', 'Describe how day, night, and seasons occur'] },
                { week: 'Week 3', topic: 'Space Travel', objectives: ['Define space travel and state its purpose', 'Identify artificial satellites and their uses in communication', 'Describe the benefits and hazards of space exploration'] },
            ]
        },
        'JSS 2': {
            'Term 1': [
                { week: 'Week 1', topic: 'Family Health: Nutrition', objectives: ['Define a balanced diet and list the six food classes', 'State the functions of carbohydrates, proteins, fats, vitamins, and minerals', 'Identify diseases associated with malnutrition (kwashiorkor, rickets)'] },
                { week: 'Week 2', topic: 'First Aid Procedures', objectives: ['Explain the meaning and objectives of First Aid', 'List the contents of a standard First Aid box', 'Demonstrate procedures for artificial respiration and treating burns/fractures'] },
                { week: 'Week 3', topic: 'Kinetic Theory of Matter', objectives: ['State the assumptions of the kinetic theory of matter', 'Explain the behavior of particles in solids, liquids, and gases', 'Apply kinetic theory to explain melting, boiling, and evaporation'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Work, Energy & Power', objectives: ['State mathematical formulas for Work, Potential Energy, Kinetic Energy, and Power', 'Calculate work done and power expended in simple exercises', 'Understand energy efficiency'] },
                { week: 'Week 2', topic: 'Simple Machines', objectives: ['Define a machine and identify types of simple machines (levers, pulleys, gears, ramps)', 'Explain mechanical advantage, velocity ratio, and efficiency of a machine', 'Construct simple models of levers and pulleys'] },
                { week: 'Week 3', topic: 'Crude Oil & Petrochemicals', objectives: ['Explain the origin and formation of crude oil and natural gas', 'Describe fractional distillation and name the major fractions of crude oil', 'Identify uses of petrochemical products (plastics, solvents, fertilizers)'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Skeletal & Digestive Systems', objectives: ['Identify bones of the human skeleton and list the functions of the skeleton', 'State the structures of the human digestive system', 'Describe stages of digestion: ingestion, digestion, absorption, and assimilation'] },
                { week: 'Week 2', topic: 'Reproductive Health', objectives: ['Identify the organs of the male and female reproductive systems', 'State the functions of reproductive organs', 'Explain fertilization, pregnancy, and fetal development'] },
            ]
        },
        'JSS 3': {
            'Term 1': [
                { week: 'Week 1', topic: 'Family Health: Drug Abuse', objectives: ['Define drug abuse and identify commonly abused drugs', 'State the social and health consequences of drug abuse', 'Describe ways of preventing drug abuse and treating drug addiction'] },
                { week: 'Week 2', topic: 'Resources from Living Things', objectives: ['Identify resources obtained from plants (wood, fiber, rubber, medicine)', 'Identify resources obtained from animals (meat, leather, honey, wool)', 'State the economic importance of forest resources'] },
                { week: 'Week 3', topic: 'Resources from Non-Living Things', objectives: ['Identify major mineral resources in Nigeria (coal, petroleum, gold, tin)', 'State the locations of mineral deposits in Nigeria', 'Explain the economic value of non-living resources'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Light Energy', objectives: ['Describe the propagation of light in a straight line', 'Explain reflection and refraction of light', 'Distinguish between converging (convex) and diverging (concave) lenses'] },
                { week: 'Week 2', topic: 'Magnetism & Electricity', objectives: ['Identify magnetic poles and describe law of magnetic attraction/repulsion', 'Distinguish between static electricity and current electricity', 'Construct simple series and parallel electrical circuits'] },
                { week: 'Week 3', topic: 'Atomic Structure & Electronics', objectives: ['State the sub-atomic particles (protons, neutrons, electrons)', 'Draw simple Bohr models of atoms', 'Identify electronic components: resistors, capacitors, and transistors'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Respiration & Excretion', objectives: ['Define respiration and write the equation for cellular respiration', 'State the difference between breathing and respiration', 'Identify excretory organs (kidneys, lungs, skin) and their waste products'] },
                { week: 'Week 2', topic: 'Genetics and Heredity', objectives: ['Define genetics and heredity', 'Identify inheritable traits (height, eye color, blood group, intelligence)', 'Explain variations among individuals of the same species'] },
            ]
        },
        'SS 1': {
            'Term 1': [
                { week: 'Week 1', topic: 'Biology & Scientific Method', objectives: ['Describe biology as the study of life and state its branches', 'Apply the scientific method in planning simple biological experiments', 'Identify laboratory tools and their safety rules'] },
                { week: 'Week 2', topic: 'Classification of Living Things', objectives: ['Explain the binomial system of nomenclature developed by Linnaeus', 'Classify living things into the five kingdoms (Monera, Protista, Fungi, Plantae, Animalia)', 'Identify characteristics of viruses and bacteria'] },
                { week: 'Week 3', topic: 'The Cell Structure & Properties', objectives: ['Identify cell organelles (nucleus, mitochondria, chloroplasts, ribosomes)', 'Distinguish between plant and animal cells under microscope', 'Explain processes of Diffusion, Osmosis, and Active Transport in cells'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Photosynthesis', objectives: ['Write the chemical equation for photosynthesis', 'Explain the light-dependent and light-independent stages of photosynthesis', 'Describe the factors affecting photosynthesis (light, CO2, temperature)'], dbTopicMatch: 'photosynthesis' },
                { week: 'Week 2', topic: 'Cellular Respiration', objectives: ['Distinguish between aerobic and anaerobic cellular respiration', 'Describe glycolysis and the citric acid cycle (Krebs cycle)', 'Identify ATP as the energy currency of the cell'], dbTopicMatch: 'cellular respiration' },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Basic Ecology Concepts', objectives: ['Define ecosystem, biosphere, biome, population, and community', 'Distinguish between biotic and abiotic factors of an ecosystem', 'Explain ecological niche and microhabitats'] },
                { week: 'Week 2', topic: 'Food Chains & Food Webs', objectives: ['Construct simple food chains and food webs for terrestrial and aquatic ecosystems', 'Explain energy flow through trophic levels', 'Describe the pyramid of energy and numbers'] },
            ]
        },
        'SS 2': {
            'Term 1': [
                { week: 'Week 1', topic: 'Digestive Systems of Animals', objectives: ['Identify teeth types and dental formulas in omnivores, herbivores, and carnivores', 'Describe chemical digestion in the mouth, stomach, and small intestine', 'State functions of liver, pancreas, and intestinal enzymes'] },
                { week: 'Week 2', topic: 'Transport Systems in Animals', objectives: ['Explain the composition of blood (red cells, white cells, platelets, plasma)', 'Describe the structure of the mammalian heart and double circulation', 'Explain blood groups, transfusion, and blood pressure'] },
                { week: 'Week 3', topic: 'Plant Transport Systems', objectives: ['Explain the functions of xylem and phloem in plants', 'Describe the mechanism of transpiration and factors affecting it', 'Explain translocation of manufactured food in plants'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Excretory Systems in Animals', objectives: ['Identify waste products of metabolism in animals', 'Describe the structure and functioning of the mammalian kidney (nephron)', 'Explain the role of the kidney in osmoregulation'] },
                { week: 'Week 2', topic: 'Nervous System & Refex Action', objectives: ['Describe the division of the nervous system (Central and Peripheral)', 'Identify the parts of the human brain and their functions', 'Trace the path of a reflex arc during reflex actions'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Endocrine System & Hormones', objectives: ['Identify major endocrine glands (pituitary, thyroid, adrenal, pancreas, gonads)', 'State the functions of hormones secreted by each gland', 'Explain consequences of hypersecretion and hyposecretion'] },
                { week: 'Week 2', topic: 'Mammalian Reproductive System', objectives: ['Identify male and female reproductive organs in mammals', 'Describe processes of spermatogenesis and oogenesis', 'Explain fertilization, implantation, gestation, and birth'] },
            ]
        },
        'SS 3': {
            'Term 1': [
                { week: 'Week 1', topic: 'Basic Genetics', objectives: ['State Mendel\'s laws of inheritance (segregation and independent assortment)', 'Solve genetic cross problems for monohybrid and dihybrid inheritance', 'Explain codominance, incomplete dominance, and sex-linked traits'] },
                { week: 'Week 2', topic: 'Chromosomes & DNA Structure', objectives: ['Describe the structure of chromosomes and chromatids', 'Describe the double-helix structure of DNA and base pairing rules', 'Explain replication of DNA and transcription to RNA'] },
            ],
            'Term 2': [
                { week: 'Week 1', topic: 'Variation and Adaptation', objectives: ['Distinguish between continuous variation (height, weight) and discontinuous variation (blood group)', 'Identify physiological and morphological adaptations in organisms', 'Explain the role of variation in natural selection'] },
                { week: 'Week 2', topic: 'Evolutionary Theories', objectives: ['Explain Lamarck\'s theory of inheritance of acquired characteristics', 'Explain Darwin\'s theory of natural selection and survival of the fittest', 'Provide fossil and anatomical evidence supporting evolution'] },
            ],
            'Term 3': [
                { week: 'Week 1', topic: 'Public Health and Disease Control', objectives: ['Identify transmission and control methods of cholera, malaria, and tuberculosis', 'Describe the role of quarantine, immunisation, and clean water in epidemic control', 'Explain vector control methods'] },
            ]
        }
    }
};

export default function Curriculum() {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    
    // UI state
    const [selectedSubject, setSelectedSubject] = useState('Mathematics');
    const [selectedGrade, setSelectedGrade] = useState('JSS 1');
    const [selectedTerm, setSelectedTerm] = useState('Term 1');
    const [expandedTopic, setExpandedTopic] = useState(null); // Expand week index for details

    // Database mapped topics
    const [dbTopics, setDbTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    // Media Assistant Drawer Modal
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaModalTitle, setMediaModalTitle] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState(null);

    useEffect(() => {
        // Fetch dashboard data to map student progress or check active database topics
        const dashboardUrl = user.role === 'teacher' 
            ? `${API_URL}/api/admin/dashboard` 
            : `${API_URL}/api/courses/dashboard`;

        axios.get(dashboardUrl, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            if (user.role === 'teacher') {
                // Compile all topics from subjects list for teachers
                const topicsList = [];
                res.data.subjects.forEach(subject => {
                    subject.topics.forEach(topic => {
                        topicsList.push({
                            id: topic.id,
                            title: topic.title,
                            subjectName: subject.name,
                            status: 'active'
                        });
                    });
                });
                setDbTopics(topicsList);
            } else {
                // Students get progress status mapping
                setDbTopics(res.data.allTopics || []);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error('Failed to fetch syllabus sync details:', err);
            setLoading(false);
        });
    }, [token, user.role]);

    // Helpers to match curriculum to seeded database topics
    const getMatchingDbTopic = (item) => {
        if (!item.dbTopicMatch) return null;
        return dbTopics.find(t => t.title.toLowerCase().includes(item.dbTopicMatch));
    };

    // Smart Media Assistant Search Trigger
    const openMediaAssistant = (topicTitle) => {
        setMediaModalTitle(topicTitle);
        const lower = topicTitle.toLowerCase();
        
        // Curated YouTube Video mappings matching Lesson.jsx, or dynamic fallback search url
        let videoId = null;
        if (lower.includes('algebra')) videoId = 'NybHckSEQBI';
        else if (lower.includes('linear')) videoId = 'L71r6N81y1s';
        else if (lower.includes('photo')) videoId = 'CMiPYHNNg28';
        else if (lower.includes('cellular') || lower.includes('respiration')) videoId = 'SrP5930gV_8';

        if (videoId) {
            setYoutubeUrl(`https://www.youtube.com/embed/${videoId}`);
        } else {
            // Standard YouTube search embedded query helper or fallback link
            setYoutubeUrl(null);
        }
        setShowMediaModal(true);
    };

    const handleYoutubeSearch = () => {
        const query = encodeURIComponent(`NERDC Secondary School ${selectedGrade} ${selectedSubject} ${mediaModalTitle}`);
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    };

    // Dynamic pre-fill helper for Teachers
    const getTeacherCreateUrl = (item) => {
        const matchingSubjectId = selectedSubject === 'Mathematics' ? 1 : 2; // Math = 1, Basic Sci = 2 standard seed
        return `/admin?action=create-topic&subjectId=${matchingSubjectId}&title=${encodeURIComponent(item.topic)}`;
    };

    const currentWeeks = CURRICULUM_DATA[selectedSubject]?.[selectedGrade]?.[selectedTerm] || [];

    return (
        <div className="page-container" style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1000 }}>
            
            {/* Page Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '2.5rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                    Syllabus Standard
                </span>
                <h1 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
                    fontWeight: 800, margin: '0 0 0.5rem',
                    letterSpacing: '-0.03em', lineHeight: 1.1
                }}>
                    NERDC <span className="gradient-text">Scheme of Work</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, maxWidth: 680 }}>
                    Official Nigerian Educational Research and Development Council national curriculum. Students can monitor their mastery roadmap, while teachers can align lesson planning.
                </p>
            </div>

            {/* Subject Selector Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                {['Mathematics', 'Basic Science'].map(sub => (
                    <button
                        key={sub}
                        onClick={() => { setSelectedSubject(sub); setExpandedTopic(null); }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: selectedSubject === sub ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                            color: selectedSubject === sub ? '#818cf8' : 'var(--text-secondary)',
                            border: '1px solid',
                            borderColor: selectedSubject === sub ? '#818cf8' : 'transparent',
                            borderRadius: '0.75rem',
                            fontSize: '0.95rem', fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {sub === 'Basic Science' && selectedGrade.startsWith('SS') ? 'Basic Science (Biology)' : sub}
                    </button>
                ))}
            </div>

            {/* Grade Level Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'].map(grade => (
                    <button
                        key={grade}
                        onClick={() => { setSelectedGrade(grade); setExpandedTopic(null); }}
                        style={{
                            padding: '0.5rem 1.1rem',
                            background: selectedGrade === grade ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                            color: selectedGrade === grade ? 'white' : 'var(--text-secondary)',
                            border: '1px solid',
                            borderColor: selectedGrade === grade ? 'var(--primary)' : 'var(--border)',
                            borderRadius: '9999px',
                            fontSize: '0.85rem', fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { if(selectedGrade !== grade) e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                        onMouseLeave={e => { if(selectedGrade !== grade) e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                        {grade}
                    </button>
                ))}
            </div>

            {/* Term Selectors */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                {['Term 1', 'Term 2', 'Term 3'].map(term => (
                    <button
                        key={term}
                        onClick={() => { setSelectedTerm(term); setExpandedTopic(null); }}
                        style={{
                            flex: 1,
                            padding: '0.625rem',
                            background: selectedTerm === term ? 'rgba(255,255,255,0.08)' : 'transparent',
                            color: selectedTerm === term ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: '1px solid',
                            borderColor: selectedTerm === term ? 'var(--border-hover)' : 'var(--border)',
                            borderRadius: '0.625rem',
                            fontSize: '0.88rem', fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {term}
                    </button>
                ))}
            </div>

            {/* Weekly Syllabus Grid */}
            <div className="card animate-fade-in-up" style={{ padding: '1.5rem', minHeight: '300px' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{ height: 60, borderRadius: '0.75rem' }} />
                        ))}
                    </div>
                ) : currentWeeks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                        <p style={{ margin: 0 }}>No syllabus schedule compiled for this selection yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {currentWeeks.map((item, index) => {
                            const dbTopic = getMatchingDbTopic(item);
                            const isExpanded = expandedTopic === index;

                            return (
                                <div
                                    key={index}
                                    style={{
                                        border: '1px solid var(--border)',
                                        borderRadius: '0.875rem',
                                        background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {/* Main Row */}
                                    <div
                                        onClick={() => setExpandedTopic(isExpanded ? null : index)}
                                        style={{
                                            padding: '1.25rem',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 280 }}>
                                            {/* Week Badge */}
                                            <div style={{
                                                padding: '0.4rem 0.8rem',
                                                background: 'rgba(255,255,255,0.06)',
                                                borderRadius: '0.5rem',
                                                fontFamily: 'Outfit, sans-serif',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                color: 'var(--text-secondary)',
                                                border: '1px solid var(--border)',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {item.week}
                                            </div>

                                            {/* Topic Name */}
                                            <div>
                                                <h3 style={{
                                                    margin: 0,
                                                    fontSize: '0.98rem',
                                                    fontWeight: 600,
                                                    color: 'var(--text-primary)',
                                                    lineHeight: 1.3
                                                }}>
                                                    {item.topic}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Status / Actions Badging */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                                            {dbTopic ? (
                                                <>
                                                    {/* Seeded and Mapped topic status markers */}
                                                    {user.role === 'student' ? (
                                                        <>
                                                            {dbTopic.progress_status === 'completed' && (
                                                                <span className="badge badge-success">✅ Mastered</span>
                                                            )}
                                                            {dbTopic.progress_status === 'unlocked' && (
                                                                <span className="badge badge-primary">📖 In Progress</span>
                                                            )}
                                                            {dbTopic.progress_status === 'locked' && (
                                                                <span className="badge badge-danger">🔒 Locked</span>
                                                            )}

                                                            {dbTopic.progress_status !== 'locked' ? (
                                                                <button
                                                                    onClick={() => navigate(`/lesson/${dbTopic.id}`)}
                                                                    className="btn-primary"
                                                                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', boxShadow: 'none' }}
                                                                >
                                                                    {dbTopic.progress_status === 'completed' ? 'Review' : 'Start'}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    disabled
                                                                    className="btn-ghost"
                                                                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', opacity: 0.5, cursor: 'not-allowed' }}
                                                                >
                                                                    Study
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="badge badge-success">🎓 ALMS Coursework</span>
                                                            <button
                                                                onClick={() => navigate(`/admin`)}
                                                                className="btn-ghost"
                                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem' }}
                                                            >
                                                                Edit
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {/* Unseeded syllabus topic resource option */}
                                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                                        Syllabus Resource
                                                    </span>

                                                    {user.role === 'teacher' ? (
                                                        <Link
                                                            to={getTeacherCreateUrl(item)}
                                                            className="btn-primary"
                                                            style={{
                                                                fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
                                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                                boxShadow: 'none', textDecoration: 'none'
                                                            }}
                                                        >
                                                            ➕ Create
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            onClick={() => openMediaAssistant(item.topic)}
                                                            className="btn-ghost"
                                                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}
                                                        >
                                                            🔍 Explore
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {/* Expand Icon */}
                                            <div style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none', marginLeft: '0.5rem' }}>
                                                ▼
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Detail Drawer */}
                                    {isExpanded && (
                                        <div style={{
                                            padding: '0 1.25rem 1.25rem',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                            background: 'rgba(0,0,0,0.1)'
                                        }}>
                                            <div style={{ paddingTop: '1rem' }}>
                                                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    🎯 Weekly Learning Objectives
                                                </h4>
                                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                                    {item.objectives.map((obj, oIdx) => (
                                                        <li key={oIdx} style={{ marginBottom: '0.25rem' }}>{obj}</li>
                                                    ))}
                                                </ul>

                                                {/* Mini Dynamic Action inside drawer */}
                                                {!dbTopic && (
                                                    <div style={{
                                                        marginTop: '1.25rem',
                                                        padding: '0.875rem 1rem',
                                                        background: 'rgba(56,189,248,0.04)',
                                                        border: '1px solid rgba(56,189,248,0.1)',
                                                        borderRadius: '0.625rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        flexWrap: 'wrap',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 500 }}>
                                                            💡 Study assistance media helper is ready for this topic.
                                                        </span>
                                                        <button
                                                            onClick={() => openMediaAssistant(item.topic)}
                                                            className="btn-ghost"
                                                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', borderColor: '#38bdf8', color: '#38bdf8' }}
                                                        >
                                                            Study Video Guide
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Smart Media Assistant Drawer Modal */}
            {showMediaModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="card animate-fade-in-up" style={{
                        width: '100%', maxWidth: 680,
                        padding: '1.75rem',
                        position: 'relative',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        {/* Close button */}
                        <button
                            onClick={() => setShowMediaModal(false)}
                            style={{
                                position: 'absolute', top: 16, right: 16,
                                background: 'rgba(255,255,255,0.06)', border: 'none',
                                color: 'var(--text-secondary)', width: 32, height: 32,
                                borderRadius: '50%', cursor: 'pointer', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            ✕
                        </button>

                        <span className="badge" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)', marginBottom: '0.75rem' }}>
                            📺 Media Assistant
                        </span>
                        
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1.25rem', color: 'var(--text-primary)', pr: '2rem' }}>
                            {mediaModalTitle}
                        </h2>

                        {youtubeUrl ? (
                            /* Embed frame if video is curated */
                            <div style={{
                                position: 'relative', width: '100%', paddingBottom: '56.25%',
                                borderRadius: '0.875rem', overflow: 'hidden',
                                border: '1px solid var(--border)', background: 'black', marginBottom: '1.25rem'
                            }}>
                                <iframe
                                    src={youtubeUrl}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                />
                            </div>
                        ) : (
                            /* Fallback cards for non-seeded custom topics */
                            <div style={{
                                padding: '2rem 1.5rem',
                                background: 'rgba(255,255,255,0.01)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.875rem',
                                textAlign: 'center',
                                marginBottom: '1.25rem'
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💡</div>
                                <h3 style={{ fontFamily: 'Outfit, sans-serif', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>No Local Seed Video</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                                    There is no pre-curated video in the ALMS database for this specific week's syllabus topic yet. However, we have assembled a customized YouTube video study search just for you!
                                </p>
                                <button
                                    onClick={handleYoutubeSearch}
                                    className="btn-primary"
                                    style={{
                                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                                    }}
                                >
                                    🔍 Search Video Guides on YouTube
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            {youtubeUrl && (
                                <button
                                    onClick={handleYoutubeSearch}
                                    className="btn-ghost"
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    More YouTube Results
                                </button>
                            )}
                            <button
                                onClick={() => setShowMediaModal(false)}
                                className="btn-primary"
                                style={{ fontSize: '0.85rem' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

pipeline {

    agent any

    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(daysToKeepStr: '25', numToKeepStr: '25'))
    }

    parameters {
        choice(
            name: 'SCRIPT_TO_RUN',
            choices: ['Client_UI_test', 'Coach_UI_test'],
            description: 'Lighthouse script name'
        )

        choice(
            name: 'ITERATIONS',
            choices: ['3', '5', '10'],
            description: 'Number of Lighthouse loops'
        )
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/vkhalaim/lighthouse-home-task'
            }
        }

        stage('Prepare') {
            steps {
                script {
                    DATE = new Date().format("yyyy-MM-dd-HH-mm-ss")
                    RESULTS_DIR = "testResults/${params.SCRIPT_TO_RUN}/${DATE}"
                    sh "mkdir -p ${RESULTS_DIR}"
                }
            }
        }

        stage('Run Lighthouse') {
            steps {
                script {
		    def DOCKER_CMD = """
		    docker run --rm \
		      -v \$WORKSPACE:/workspace \
		      -w /workspace \
		      ibombit/lighthouse-puppeteer-chrome:latest \
		      node UI_scripts/${params.SCRIPT_TO_RUN}.js ${params.ITERATIONS}
		    """

		    try {
			sh DOCKER_CMD
		    } catch (err) {
			error("Lighthouse execution failed: ${err}")
		    }
		}
            }
        }

        stage('Archive Results') {
            steps {
                archiveArtifacts allowEmptyArchive: true,
                                 artifacts: '**/*.report.html',
                                 onlyIfSuccessful: false
            }
        }

        stage('Publish HTML Reports') {
	    steps {
		script {
		    def iterations = params.ITERATIONS.toInteger()
		    for (int i = 1; i <= iterations; i++) {
		        publishHTML([
		            allowMissing: true,
		            alwaysLinkToLastBuild: false,
		            keepAll: true,
		            reportDir: '.',
		            reportFiles: "user-flow-${i}.report.html",
		            reportName: "Lighthouse Iteration ${i}"
		        ])
		    }
		}
	    }
	}
    }

    post {
        success {
            echo "Lighthouse test completed successfully."
        }
        failure {
            echo "Lighthouse test failed."
        }
    }
}

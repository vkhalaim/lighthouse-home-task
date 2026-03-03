pipeline {

    agent any

    options {
        disableConcurrentBuilds()
    }

    parameters {
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

        stage('Run Lighthouse') {
	    steps {
		sh '''
		echo "Running Lighthouse..."
		docker run --rm \
		  -v "$PWD":/workspace \
		  -w /workspace \
		  ibombit/lighthouse-puppeteer-chrome:latest \
		  node shop-test.js ${ITERATIONS}
		'''
	    }
	}

        stage('Archive Reports') {
            steps {
                archiveArtifacts artifacts: '*.report.html',
                                 allowEmptyArchive: true
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

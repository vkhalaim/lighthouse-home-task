pipeline {

    agent any

    parameters {
        choice(
            name: 'ITERATIONS',
            choices: ['1','3','5','10'],
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
                DATE=$(date +%F-%H-%M-%S)
                RESULTS=testResults/$DATE
                mkdir -p $RESULTS

                CONTAINER=$(docker create \
                    femtopixel/google-lighthouse-puppeteer:v9.6.8-v19.2.0-1.3.3 \
                    sleep infinity)

                # Copy project into container
                docker cp . $CONTAINER:/lighthouse

                # Start container
                docker start $CONTAINER

                # Install dependencies from package.json
                docker exec -u root $CONTAINER sh -c "
                cd /lighthouse &&
                npm install &&
                npx puppeteer browsers install chrome
                "

                # Run Lighthouse script
                docker exec $CONTAINER \
                    node /lighthouse/shop-test.cjs \
                    --outputFolder /lighthouse/$RESULTS \
                    -n ${ITERATIONS}

                # Copy results back to Jenkins workspace
                docker cp $CONTAINER:/lighthouse/testResults ./testResults

                # Remove container
                docker rm -f $CONTAINER
                '''
            }
        }

    }

    post {
        always {
            archiveArtifacts artifacts: 'testResults/**', allowEmptyArchive: true
        }
    }
}